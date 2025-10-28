"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";
import React from "react";

export default function PostsPage({params}) {
  const [posts, setPosts] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const { id } = React.use(params);
  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase.from("posts").select(" id, user_id, post_content, users(name, email)").eq('user_id', id);
      if (error) {
        setErrorMsg(error.message);
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data);
        console.log("Posts fetched successfully:", data);
      }
    }
    fetchPosts();

  }, [id]);

  return (
    <div style={{backgroundColor: 'lightblue', color: 'black', paddingBottom: '371px', paddingLeft: '20px', paddingTop: '20px'}}>
      <h1>This is the posts</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <ul>
        {posts?.map(({ id, user_id, post_content, users }) => (
          <li key={id}>
            <h2>{users?.name}</h2>
            <p>{post_content}</p>
            <Link href={`/posts/${id}`}>View Comments</Link>
          </li>
        ))}
      </ul>
      
      <Link href="/about">Back to Users</Link>
    </div>
  );
}