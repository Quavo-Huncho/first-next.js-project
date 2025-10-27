"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({email, password});
    if(error){
      setErrorMsg(error.message);
      setSuccessMsg(null);
    }else {
      const currentUser = data.user;
      await supabase.from("users").insert([{id: currentUser.id, email: currentUser.email}]);
      setSuccessMsg("Signed in successfully");
      setErrorMsg(null);
      router.push("/sign-in");
    }
  }  
  return(
    <div>
      <form>
        <input type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
        <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
        <button type="submit" onClick={handleSignUp}>Sign Up</button>
      </form>
    </div>
  )
}