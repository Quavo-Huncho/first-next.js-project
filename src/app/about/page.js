
"use client";
import { useState, useEffect, use } from "react";
import SignupButton from "@/components/signup";
import {  supabase } from "@/lib/supabase"; 
import Link from "next/link"; 

export default function AboutPage() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      if (error) {
        console.error("Error fetching users:", error);
      }else{
        setUsers(data);
      }
    }
    fetchUsers();


  })

  async function handleDelete(userId) {
      const { error } = await supabase.from("users").delete().eq("id", userId);
    }

    async function addUser() {
      const { error } = await supabase.from("users").insert([{name, email}])
    }
  return (
    <div style={{marginBottom: '10px', backgroundColor: 'lightblue', color: 'black', padding: '20px'}}>
      <p style={{fontSize: '40px', color: 'green'}}>These are the users</p><br />
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <h2>NAME: {user.name}</h2>
            <p>EMAIL: {user.email}</p>
            <Link href={`/about/posts_id/${user.id}`}>View Posts by {user.name}</Link> <br />
            <Link href={`/about/courses_id/${user.id}`}>View Courses by {user.name}</Link><br />
            <Link href={`/about/allPages/${user.id}`}>View all details by {user.name}</Link><br /><br />
            <button onClick={() => handleDelete(user.id)}>Delete User</button>
            
          </li>
        ))}
      </ul>
      <input name="name" onChange={(e) => setName(e.target.value)} value={name}/>
      <input name="email" onChange={(e) => setEmail(e.target.value)} value={email}/>
      <button onClick={addUser}>Submit</button>
    </div>
  ) 
}


