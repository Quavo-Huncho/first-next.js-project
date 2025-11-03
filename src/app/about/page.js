
"use client";
import { useState, useEffect, use } from "react";
import {  supabase } from "@/lib/supabase"; 
import Link from "next/link";
import { useRouter } from "next/navigation"; 

export default function AboutPage() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [editUserId, setEditUserId] = useState(null); // stores which user is being edited

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
    // Set up real-time subscription to 'users' table
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('Change received!', payload)
          handleDatabaseChange(payload)
        }
      )
      .subscribe()
    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel)
    }

  },[])

  const handleDatabaseChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setUsers((prev) => [payload.new, ...prev])  
    } else if (payload.eventType === 'UPDATE') {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === payload.new.id ? payload.new : user
        )
      )
    } else if (payload.eventType === 'DELETE') {
      setUsers((prev) =>
        prev.filter((user) => user.id !== payload.old.id)
      )
    }
  }

  async function handleDelete(userId) {
      const { error } = await supabase.from("users").delete().eq("id", userId);
      if(error) {
        setErrorMsg(error.message);
        setSuccessMsg(null);
      }else{
        setSuccessMsg("User deleted successfully");
        setErrorMsg(null);
        setUsers((prev) => prev.filter((c) => c.id !== userId));

        setTimeout(() => {
          setSuccessMsg(null);
        }, 3000);
      }
    }

    async function addUser() {
      const { data, error } = await supabase.from("users").insert([{name, email}]).select();
      if(error) {
        setErrorMsg(error.message);
        setSuccessMsg(null);
      }else{
        setSuccessMsg("User added successfully");
        setErrorMsg(null);
        setUsers((prev) => [...prev, ...data]);

        setTimeout(() => {
          setSuccessMsg(null);
        }, 3000);
      }
    }

    async function edituserDetails(userId) {
      const { error } = await supabase.from("users").update([{
        name: name, email: email
      }]).eq('id', userId)

      if(error){
        setErrorMsg(error.message);
        setSuccessMsg(null);
      }else {
        setSuccessMsg('User successfully edited');
        setErrorMsg(null);
        setEditUserId(null);
        setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, name: name, email: email } : user)));

        setTimeout(() => {
          setSuccessMsg(null);
        }, 3000)
      }

      
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

            <button onClick={() => {
              setEditUserId(user.id);
              setName(user.name);
              setEmail(user.email)
            }}>Edit User</button>

            {editUserId === user.id && (
              <div>
                <h2>Edit course</h2>
                <input name="name" placeholder="Name" onChange={(e) => setName(e.target.value)} value={name}/>
                <input name="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} value={email}/>
                <button onClick={() => edituserDetails(user.id)}>Submit Edit</button>
                <button onClick={() => setEditUserId(null)}>Cancel</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
      <h2>Add a new user</h2>
      <input name="name" placeholder="Name" onChange={(e) => setName(e.target.value)} value={name}/>
      <input name="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} value={email}/>
      <button onClick={addUser}>Add user</button>
    </div>
  ) 
}


