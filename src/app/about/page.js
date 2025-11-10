"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase"; 
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading"; 

export default function AboutPage() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 5;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    const { data, error } = await supabase.from("users").select("*").order("created_at", {ascending:false}).range(start, end);
    if (error) {
      console.error("Error fetching users:", error);
      setErrorMsg("Failed to fetch users");
    } else {
      setUsers(data);
    }
    setLoading(false);
  }, [page, limit]);
  
  const handleDatabaseChange = useCallback((payload) => {
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
  }, []);

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

  },[page, fetchUsers, handleDatabaseChange])

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
    if (!name.trim() || !email.trim()) {
      setErrorMsg("Name and email are required");
      return;
    }
    const { data, error } = await supabase.from("users").insert([{name, email}]).select();
    if(error) {
      setErrorMsg(error.message);
      setSuccessMsg(null);
    }else{
      setSuccessMsg("User added successfully");
      setErrorMsg(null);
      setName("");
      setEmail("");
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    }
  }

  async function edituserDetails(userId) {
    if (!name.trim() || !email.trim()) {
      setErrorMsg("Name and email are required");
      return;
    }
    const { error } = await supabase.from("users").update({
      name: name, email: email
    }).eq('id', userId);

    if(error){
      setErrorMsg(error.message);
      setSuccessMsg(null);
    }else {
      setSuccessMsg('User successfully edited');
      setErrorMsg(null);
      setEditUserId(null);
      setName("");
      setEmail("");
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, name: name, email: email } : user)));
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    }
  }

  function nextPage() {
    setPage(page + 1);
  }
  
  function prevPage() {
    if (page > 1) {
      setPage(page - 1);
    }
  }

  function handleCancelEdit() {
    setEditUserId(null);
    setName("");
    setEmail("");
  }

  if (loading && users.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">User Management</h1>
          <p className="text-xl text-white/80">Manage your users with ease</p>
        </motion.div>

        {errorMsg && <Alert message={errorMsg} type="error" onClose={() => setErrorMsg(null)} />}
        {successMsg && <Alert message={successMsg} type="success" onClose={() => setSuccessMsg(null)} />}

        {/* Add User Form */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New User</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              name="name"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              name="email"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button onClick={addUser} variant="success">Add User</Button>
        </Card>

        {/* Users List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {users.map((user, index) => (
            <Card key={user.id} delay={index * 0.1}>
              {editUserId === user.id ? (
                <div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800">Edit User</h3>
                  <div className="space-y-3 mb-4">
                    <Input
                      name="name"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => edituserDetails(user.id)} variant="success" className="flex-1">
                      Save
                    </Button>
                    <Button onClick={handleCancelEdit} variant="secondary" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <Link href={`/about/posts_id/${user.id}`} className="block text-blue-600 hover:text-blue-800 transition-colors">
                      → View Posts
                    </Link>
                    <Link href={`/about/courses_id/${user.id}`} className="block text-blue-600 hover:text-blue-800 transition-colors">
                      → View Courses
                    </Link>
                    <Link href={`/about/allPages/${user.id}`} className="block text-blue-600 hover:text-blue-800 transition-colors">
                      → View All Details
                    </Link>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditUserId(user.id);
                        setName(user.name);
                        setEmail(user.email);
                      }}
                      variant="success"
                      className="flex-1 text-sm py-2 px-3"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(user.id)}
                      variant="danger"
                      className="flex-1 text-sm py-2 px-3"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-white/80 text-xl">No users found. Add your first user above!</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            onClick={prevPage}
            disabled={page === 1}
            variant="secondary"
          >
            Previous
          </Button>
          <span className="text-white font-semibold text-lg bg-white/10 px-6 py-2 rounded-lg">
            Page {page}
          </span>
          <Button
            onClick={nextPage}
            disabled={users.length < limit}
            variant="secondary"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  ) 
}


