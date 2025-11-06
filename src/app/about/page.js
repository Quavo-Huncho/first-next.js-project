
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
  const [page, setPage] = useState(1);
  const limit = 5;

  async function fetchUsers() {
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      const { data, error } = await supabase.from("users").select("*").order("created_at", {ascending:false}).range(start, end);
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data);
      }
  }
  
  useEffect(() => {
    
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

  },[page])

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
        //setUsers((prev) => [...prev, ...data]);

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

//For next page and previous page
    function nextPage() {
      setPage(page + 1);
    }
    function prevPage() {
      setPage(page - 1);
    }

  return (
    <div style={{marginBottom: '10px', backgroundColor: 'lightblue', color: 'black', padding: '20px'}}>
      <h1>These are the users</h1><br />
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <h2>NAME: {user.name}</h2>
            <p>EMAIL: {user.email}</p>
            <Link href={`/about/posts_id/${user.id}`}>View Posts by {user.name}</Link> <br />
            <Link href={`/about/courses_id/${user.id}`}>View Courses by {user.name}</Link><br />
            <Link href={`/about/allPages/${user.id}`}>View all details by {user.name}</Link><br />

            <button onClick={() => {
              setEditUserId(user.id);
              setName(user.name);
              setEmail(user.email)
            }} className="edit">Edit User</button>
            <button onClick={() => handleDelete(user.id)} className="delete">Delete User</button><br /><br />

            {editUserId === user.id && (
              <div>
                <h2>Edit course</h2>
                <input name="name" placeholder="Name" onChange={(e) => setName(e.target.value)} value={name} className="userInput"/>
                <input name="email" className="userInput" placeholder="Email" onChange={(e) => setEmail(e.target.value)} value={email} />
                <button onClick={() => edituserDetails(user.id)}>Submit Edit</button>
                <button onClick={() => setEditUserId(null)}>Cancel</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
      <h2 className="sub-head">Add a new user</h2>
      <input name="name" placeholder="Name" onChange={(e) => setName(e.target.value)} value={name}/>
      <input name="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} value={email}/>
      <button onClick={addUser} className="add">Add user</button>
      <br />
      <button onClick={prevPage}>prev</button>
      <span style={{ margin: '0 5px' }}>page {page}</span>
      <button onClick={nextPage}>next</button>
    </div>
  ) 
}


