"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

interface SecretMessage {
  id: string;
  message: string;
}

export default function SecretMessageForm({ userId, allowDelete }: { userId: string, allowDelete?: boolean }) {
  const supabase = createClient();
  const [messages, setMessages] = useState<SecretMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch all messages for the user
  useEffect(() => {
    async function fetchSecrets() {
      const { data, error } = await supabase
        .from("secrets")
        .select("id, message")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching secrets:", error.message);
      } else {
        setMessages(data || []);
      }
    }
    fetchSecrets();
  }, [userId]);

  // Save or update secret message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (messages.length > 0 && !editingId) {
      alert("You can only have one secret message.");
      return;
    }

    if (editingId) {
      // Update existing message
      const { error } = await supabase
        .from("secrets")
        .update({ message: newMessage })
        .eq("id", editingId);

      if (error) {
        console.error("Error updating message:", error.message);
        alert("Error updating message: " + error.message);
      } else {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === editingId ? { ...msg, message: newMessage } : msg))
        );
        setNewMessage("");
        setEditingId(null);
      }
    } else {
      // Insert new message
      const { data, error } = await supabase
        .from("secrets")
        .insert([{ user_id: userId, message: newMessage }])
        .select()
        .single();

      if (error) {
        console.error("Error saving message:", error.message);
        alert("Error saving message: " + error.message);
      } else {
        setMessages([...messages, data]);
        setNewMessage("");
      }
    }
  };

  // Delete secret message
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("secrets").delete().eq("id", id);

    if (error) {
      console.error("Error deleting message:", error.message);
      alert("Error deleting message: " + error.message);
    } else {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      if (editingId === id) {
        setNewMessage("");
        setEditingId(null);
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <h3 className="font-bold text-lg mb-2">Your Secret Messages</h3>

      {messages.length > 0 ? (
        <ul className="space-y-2">
          {messages.map(({ id, message }) => (
            <li
              key={id}
              className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
            >
              <span className="break-words w-full">{message}</span> {/* Prevents overflow */}
              {allowDelete && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(id);
                      setNewMessage(message);
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(id)}>
                    Delete
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No secret messages yet.</p>
      )}

      {/* Show input only if allowDelete is true */}
      {allowDelete && (
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter your secret message..."
            className="w-full p-2 border rounded-md"
          />
          <Button type="submit" className="mt-2 w-full">
            {editingId ? "Update Secret" : "Save Secret"}
          </Button>
        </form>
      )}
    </div>
  );
}
