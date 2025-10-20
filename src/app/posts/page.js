"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [newPostContent, setNewPostContent] = useState("");
  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase.from("posts").select(`id, post_content, user_id, users(name, email)`);
      if (error) {
        setErrorMsg(error.message);
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data);
        console.log("Posts fetched successfully:", data);
      }
    }
    fetchPosts();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await supabase.from("posts").insert([{user_id: "947979fc-1baf-4f22-8880-87773136cd46", post_content: newPostContent}]);
  }

  function handleChange(event) {
    setNewPostContent(event.target.value);
  }

  return (
    <div style={{backgroundColor: 'lightblue', color: 'black', padding: '20px'}}>
      <h1>This is the posts</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <ul>
        {posts?.map(({ id, user_id, post_content, users }) => (
          <li key={id}>
            <h2>{users?.name}</h2>
            <p>{post_content}</p>
            <Link href={`/posts/${id}`}>View Post</Link><br />
            <Link href={`/about/posts_id/${user_id}`}>View All Posts by {users?.name}</Link><br />
            <Link href={`/posts/edit_post/${id}`}>Edit Post</Link><br /><br />
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input type="text" name="post_content" placeholder="Write your post here" value={newPostContent} required onChange={handleChange}/>
        <button type="submit">Submit Post</button>
      </form>
    </div>
  );
}