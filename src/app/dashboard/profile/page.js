"use client";

import ProfileView from "@/components/ProfileView";

export default function ProfilePage() {
  // Using a mock user for now.
  // In a real application, fetch user details using a React Context or SWR/React Query.
  const user = { name: "Usuário", username: "usuario" };

  return (
    <div className="fade-in" style={{ padding: "0" }}>
      <ProfileView user={user} />
    </div>
  );
}
