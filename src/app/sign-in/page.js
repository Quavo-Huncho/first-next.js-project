"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({email, password});
    if(error){
      setErrorMsg(error.message);
      setSuccessMsg(null);
    }else {
      setSuccessMsg("Signed in successfully");
      setErrorMsg(null);
      router.push("/");
    }
  }  
  return(
    <div>
      <form>
        <input type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
        <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
        <button type="submit" onClick={handleSignIn}>Sign In</button>
      </form>
    </div>
  )
}