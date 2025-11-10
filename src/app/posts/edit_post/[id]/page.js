"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function EditPostPage({params}) {
  const [postContent, setPostContent] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const postId = params?.id;
  useEffect(() => {
    if (!postId) return;

    async function fetchPost() {
      const { data, error } = await supabase.from("posts").select("post_content").eq('id', postId).single();
      if (error) {
        setErrorMsg(error.message);
        console.error("Error fetching post:", error);
      } else {
        setPostContent(data.post_content);
        console.log("Post fetched successfully:", data);
      }
    }
    fetchPost();
  }, [postId]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!postId) return;
    const { error } = await supabase.from("posts").update({ post_content: postContent }).eq('id', postId);
    if (error) {
      setErrorMsg(error.message);
      setSuccessMsg(null);
      console.error("Error updating post:", error);
    } else {
      setSuccessMsg("Post updated successfully!");
      setErrorMsg(null);
      console.log("Post updated successfully");
    }
  }

  function handleChange(event) {
    setPostContent(event.target.value);
  }
  return (
    <div style={{backgroundColor: 'lightblue', color: 'black', padding: '20px'}}>
      <h1>Edit Post</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
      <form onSubmit={handleSubmit}>
        <textarea name="post_content" value={postContent} onChange={handleChange} rows="4" cols="50" required />
        <br />
        <button type="submit">Update Post</button>
      </form>
      <br />
      <Link href="/posts">Back to Posts</Link>
    </div>
  );
}
