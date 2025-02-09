"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function UpdateProfile({ userId }: { userId: string }) {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      // Fetch the authenticated user's email
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Error fetching user email:", authError.message);
        return;
      }
      setEmail(authData?.user?.email || null);

      // Fetch profile data
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, bio")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.message.includes("No rows returned")) {
          // No profile found, allow user to fill in data
          setDisplayName("");
          setBio("");
        } else {
          console.error("Error fetching profile:", error.message);
        }
      } else {
        // If profile exists, set the profile data
        setDisplayName(data?.display_name || "");
        setBio(data?.bio || "");
      }
    }
    fetchProfile();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); 
    setLoading(true);

    // Validate the input before submitting
    if (!displayName.trim() && !bio.trim()) {
      setErrorMessage("Please enter at least a display name or bio.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert([{ user_id: userId, display_name: displayName, bio }], {
        onConflict: "user_id",
      });

    setLoading(false);

    if (error) {
      console.error("Error updating profile:", error.message);
      alert("Error updating profile: " + error.message);
    } else {
      alert("Profile updated successfully!");
      setIsEditing(false); 
    }
  };

  return (
    <div className="w-full max-w-md">
      <h3 className="font-bold text-lg mb-2">Update Your Profile</h3>
      {email && (
        <p className="mb-4">
          <strong>Email:</strong> {email}
        </p>
      )}
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="mb-4">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Enter your bio"
              className="w-full p-2 border rounded-md"
            />
          </div>
          {errorMessage && (
            <div className="text-red-500 mb-4 text-sm">{errorMessage}</div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      ) : (
        <div>
          <p>
            <strong>Display Name:</strong> {displayName || "Not set"}
          </p>
          <p>
            <strong>Bio:</strong> {bio || "Not set"}
          </p>
          <Button onClick={() => setIsEditing(true)} className="mt-4 w-full">
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}
