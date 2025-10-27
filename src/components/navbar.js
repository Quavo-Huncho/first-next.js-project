"use client";
import { supabase } from "@/lib/supabase"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import {useState, useEffect, use} from "react";

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState(null);


    const handleGetUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    }

   
handleGetUser();

   const handleLogOut = async () => {
      await supabase.auth.signOut();
      router.push("/sign-in");
      setUser(null);
    }

  return (
    <div>
      <div style={{display: 'flex', backgroundColor: 'black', color: 'red', paddingBottom: '30px', paddingTop: '30px', paddingLeft:'10px', gap: '200px'}}>
        <button style={{all: 'unset', color: 'inherit', cursor: 'pointer'}}><Link href={"/"}>HOME</Link></button>
        <button style={{all: 'unset', color: 'inherit', cursor: 'pointer'}}><Link href={"/about"}>USERS</Link></button>
        <button style={{all: 'unset', color: 'inherit', cursor: 'pointer'}}><Link href={"/courses"}>COURSES</Link></button>
        {user ? (        <button type="button" onClick={handleLogOut}>Log Out</button>
        ) : ("")}

        </div>
    </div>
  )
}