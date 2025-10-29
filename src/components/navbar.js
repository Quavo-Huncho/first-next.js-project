"use client";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ✅ Check current user on load
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    // ✅ Listen for sign in / sign out changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // ✅ Cleanup on unmount
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          backgroundColor: "black",
          color: "red",
          paddingBottom: "30px",
          paddingTop: "30px",
          paddingLeft: "10px",
          gap: "200px",
        }}
      >
        <button style={{ all: "unset", color: "inherit", cursor: "pointer" }}>
          <Link href={"/"}>HOME</Link>
        </button>

        <button style={{ all: "unset", color: "inherit", cursor: "pointer" }}>
          <Link href={"/about"}>USERS</Link>
        </button>

        <button style={{ all: "unset", color: "inherit", cursor: "pointer" }}>
          <Link href={"/courses"}>COURSES</Link>
        </button>

        {user ? (
          <button type="button" onClick={handleLogOut}>
            Log Out
          </button>
        ) : (
          <button style={{ all: "unset", color: "inherit", cursor: "pointer" }}>
            <Link href={"/sign-in"}>Sign In</Link>
          </button>
        )}
      </div>
    </div>
  );
}