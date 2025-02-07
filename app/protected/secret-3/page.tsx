"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function SecretPage3({ userId }: { userId: string }) {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: session } = await supabase.auth.getSession();
      if (!session || !session.session) {
        console.error("User is not authenticated.");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const authenticatedUserId = userData?.user?.id;
      if (!authenticatedUserId) return;

      // Fetch all users excluding the authenticated user
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .neq("user_id", authenticatedUserId);

      if (usersError) {
        console.error("Error fetching users:", usersError);
        return;
      }

      // Fetch friends
      const { data: friendsData, error: friendsError } = await supabase
        .from("friends")
        .select("friend_id, status")
        .eq("user_id", authenticatedUserId)
        .eq("status", "accepted"); // ✅ Only fetch accepted friends

      if (friendsError) {
        console.error("Error fetching friends:", friendsError);
        return;
      }

      // Fetch friend requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("friends")
        .select("user_id, status")
        .eq("friend_id", authenticatedUserId)
        .eq("status", "pending");

      if (requestsError) {
        console.error("Error fetching friend requests:", requestsError);
        return;
      }

      setUsers(usersData || []);
      setFriends(friendsData || []);
      setRequests(requestsData || []);
    }

    fetchData();
  }, [userId]);

  async function fetchSecretMessage(friendId: string) {
    const { data, error } = await supabase
      .from("secrets")
      .select("message")
      .eq("user_id", friendId)
      .maybeSingle();

    if (error) {
      if (error.message?.includes("not authorized")) {
        alert("Unauthorized: You are not allowed to view this secret.");
      } else {
        console.error("Error fetching secret:", error);
      }
      return;
    }

    setSelectedMessage(data?.message || "No message found.");
    setShowModal(true);
  }

  async function sendFriendRequest(friendId: string) {
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (!session || !session.session) {
      alert("You are not authenticated. Please log in again.");
      return;
    }
  
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (!userData?.user?.id) {
      alert("Failed to get authenticated user. Please try again.");
      return;
    }
  
    const authenticatedUserId = userData.user.id;
  
    const { data, error } = await supabase
      .from("friends")
      .insert([{ user_id: authenticatedUserId, friend_id: friendId, status: "pending" }]);
  
    if (error) {
      alert(`Failed to send request: ${error.message}`);
    } else {
      alert("Friend request sent!");
      fetchData();  // Refresh data after adding the friend
    }
  }   
  
  async function acceptFriendRequest(requesterId: string) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user?.id) {
      alert("You are not authenticated. Please log in again.");
      return;
    }
  
    const authenticatedUserId = userData.user.id;
  
    // Update the existing friend request
    const { error: updateError } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .match({ user_id: requesterId, friend_id: authenticatedUserId });
  
    if (updateError) {
      alert(`Failed to accept request: ${updateError.message}`);
      return;
    }
  
    // Insert the reverse friendship entry
    const { error: insertError } = await supabase
      .from("friends")
      .insert([{ user_id: authenticatedUserId, friend_id: requesterId, status: "accepted" }]);
  
    if (insertError) {
      alert(`Failed to complete friendship: ${insertError.message}`);
    } else {
      alert("Friend request accepted! You are now friends.");
      fetchData();  // Refresh data after accepting the friend request
    }
  }    
  
  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="font-bold text-xl mb-4">Secret Page 3</h2>
      <p>Be very careful adding a user means your secret message will be reveal to that user</p>
  
      {/* Users List */}
      <h3 className="font-semibold text-lg mt-4">Users</h3>
      <ul>
  {users.map((user) => {
    const initials = user.display_name
      ? user.display_name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
      : "?";

    // Check if user is a friend
    const isFriend = friends.some((friend) => friend.friend_id === user.user_id);
    
    // Check if a request was sent
    const isPending = requests.some((req) => req.user_id === user.user_id);

    return (
      <li key={user.user_id} className="flex justify-between items-center border-b py-2">
        <div className="flex items-center space-x-3 mr-4">
          {/* Avatar with Initials */}
          <div className="w-10 h-10 flex items-center justify-center bg-gray-300 text-black font-bold rounded-full">
            {initials}
          </div>
          <p>{user.display_name || "Unnamed User"}</p>
        </div>
        
        {!isFriend && !isPending ? (
          <Button size="sm" onClick={() => sendFriendRequest(user.user_id)}>
            Add Friend
          </Button>
        ) : isPending ? (
          <Button size="sm" disabled className="bg-gray-400 cursor-not-allowed">
            Pending
          </Button>
        ) : null} {/* No button if already a friend */}
      </li>
    );
  })}
</ul>

  
      {/* Friend Requests */}
      <h3 className="font-semibold text-lg mt-4">Friend Requests</h3>
      <ul>
        {requests.map((req) => (
          <li key={req.user_id} className="flex justify-between items-center border-b py-2">
            <span>Request from: {req.user_id}</span>
            <Button size="sm" onClick={() => acceptFriendRequest(req.user_id)}>Accept</Button>
          </li>
        ))}
      </ul>
  
      {/* Friends List */}
      <h3 className="font-semibold text-lg mt-4">Friends</h3>
      <ul>
        {friends.map(({ friend_id }) => (
          <li 
            key={friend_id} 
            className="cursor-pointer text-blue-500 hover:underline"
            onClick={() => fetchSecretMessage(friend_id)}
          >
            {friend_id}
          </li>
        ))}
      </ul>
  
      {/* Secret Message Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl max-w-lg w-full md:max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Secret Message</h2>
            <p className="text-lg text-gray-800 dark:text-gray-200">{selectedMessage}</p>
            <button 
              className="mt-6 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-lg"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );  
}
