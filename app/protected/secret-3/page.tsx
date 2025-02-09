"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function SecretPage3({ userId }: { userId: string }) {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
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
        .eq("status", "accepted"); 

      if (friendsError) {
        console.error("Error fetching friends:", friendsError);
        return;
      }

      // Fetch received friend requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("friends")
        .select("user_id, status")
        .eq("friend_id", authenticatedUserId)
        .eq("status", "pending");

      if (requestsError) {
        console.error("Error fetching friend requests:", requestsError);
        return;
      }

      // Fetch sent friend requests
      const { data: sentRequestsData, error: sentRequestsError } = await supabase
        .from("friends")
        .select("friend_id, status")
        .eq("user_id", authenticatedUserId)
        .eq("status", "pending");

      if (sentRequestsError) {
        console.error("Error fetching sent friend requests:", sentRequestsError);
        return;
      }

      const friendIds = friendsData.map((friend) => friend.friend_id);
      const { data: friendsProfiles, error: friendsProfilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", friendIds);

      if (friendsProfilesError) {
        console.error("Error fetching friends' profiles:", friendsProfilesError);
        return;
      }

      const requestUserIds = requestsData.map((req) => req.user_id);
      const { data: requestProfiles, error: requestProfilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", requestUserIds);
    
      if (requestProfilesError) {
        console.error("Error fetching request profiles:", requestProfilesError);
        return;
      }

      const friendsWithNames = friendsData.map((friend) => {
        const profile = friendsProfiles.find((profile) => profile.user_id === friend.friend_id);
        return {
          ...friend,
          display_name: profile?.display_name || "Unnamed Friend",
        };
      });

      const requestsWithNames = requestsData.map((req) => {
        const profile = requestProfiles.find((profile) => profile.user_id === req.user_id);
        return {
          ...req,
          display_name: profile?.display_name || "Unknown User",
        };
      });

      setUsers(usersData || []);
      setFriends(friendsWithNames || []);
      setRequests(requestsWithNames || []);
      setSentRequests(sentRequestsData || []);
    }

    fetchData();
  }, [userId]);

  async function fetchSecretMessage(friendId: string) {
    const isFriend = friends.some((friend) => friend.friend_id === friendId);
  
    if (!isFriend) {
      setSelectedMessage("Unauthorized: You are not allowed to view this secret.");
      setShowModal(true);
      return;
    }
  
    // Fetch the secret message for the friend
    const { data, error } = await supabase
      .from("secrets")
      .select("message")
      .eq("user_id", friendId)
      .maybeSingle();
  
    if (error) {
      console.error("Error fetching secret:", error);
      return;
    }
  
    if (!data || !data.message) {
      setSelectedMessage("No message available.");
    } else {
      setSelectedMessage(data.message);
    }
    
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
      window.location.reload();
    }
  }   
  
  async function acceptFriendRequest(requesterId: string) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
  
    if (userError || !userData?.user?.id) {
      alert("You are not authenticated. Please log in again.");
      return;
    }
  
    const authenticatedUserId = userData.user.id;
  
    // Update the friend request status
    const { error: updateError } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .match({ user_id: requesterId, friend_id: authenticatedUserId });
  
    if (updateError) {
      alert(`Failed to accept request: ${updateError.message}`);
      return;
    }
  
    // Insert the reciprocal friendship entry
    const { error: insertError } = await supabase
      .from("friends")
      .insert([{ user_id: authenticatedUserId, friend_id: requesterId, status: "accepted" }]);
  
    if (insertError) {
      alert(`Failed to complete friendship: ${insertError.message}`);
    } else {
      alert("Friend request accepted! You are now friends.");
      window.location.reload();
    }
  }     
  
  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="font-bold text-2xl mb-6 text-center">Secret Page 3</h2>
      <p className="text-center mb-6">Be very careful adding a user means your secret message will be revealed to that user</p>
  
      {/* Users List */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-4">Users</h3>
        <p className="mb-4">A list of users you can add or view.<br /> <span className='text-red-500'>*</span><span> Note: Users must complete their profile (e.g., set up their name) before they will be displayed here.</span></p>
        <ul className="space-y-4">
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
            const isPending = requests.some((req) => req.user_id === user.user_id) || sentRequests.some((req) => req.friend_id === user.user_id);

            return (
              <li key={user.user_id} className="flex justify-between items-center border-b py-2">
                <div className="flex items-center space-x-3">
                  {/* Avatar with Initials */}
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-300 text-black font-bold rounded-full">
                    {initials}
                  </div>
                  <p 
                    className="cursor-pointer text-blue-500 hover:underline"
                    onClick={() => fetchSecretMessage(user.user_id)}
                  >
                    {user.display_name || "Unnamed User"}
                  </p>
                </div>
                
                {!isFriend && !isPending ? (
                  <Button size="sm" onClick={() => sendFriendRequest(user.user_id)}>
                    Add Friend
                  </Button>
                ) : isPending ? (
                  <Button size="sm" disabled className="bg-gray-400 cursor-not-allowed">
                    Pending
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
  
      {/* Friend Requests */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-4">Friend Requests</h3>
        <ul className="space-y-4">
          {requests.map((req) => (
            <li key={req.user_id} className="flex justify-between items-center border-b py-2">
              <span>{req.display_name}</span>
              <Button size="sm" onClick={() => acceptFriendRequest(req.user_id)}>Accept</Button>
            </li>
          ))}
        </ul>
      </div>
  
      {/* Friends List */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-4">Friends</h3>
        <p className="mb-4">Click on the name of your friend to view their secret message</p>
        <ul className="space-y-4">
          {friends.map(({ friend_id, display_name }) => (
            <li 
              key={friend_id} 
              className="cursor-pointer text-blue-500 hover:underline"
              onClick={() => fetchSecretMessage(friend_id)}
            >
              {display_name}
            </li>
          ))}
        </ul>
      </div>
  
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