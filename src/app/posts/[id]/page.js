"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation"; // ✅ Added

export default function PostsPage() {
  const params = useParams(); // ✅ get dynamic post id from URL
  const postId = params?.id;

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [newComments, setnewComments] = useState("");
  const [newEditComments, setnewEditComments] = useState("");

  useEffect(() => {
    if (!postId) return;

    async function fetchPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select(`id, post_content, user_id, users(name, email)`)
        .eq("id", postId);

      if (error) {
        setErrorMsg(error.message);
      } else {
        setPosts(data);
      }
    }

    async function fetchComments() {
      const { data, error } = await supabase
        .from("comments")
        .select(`id, comment_text, post_id, users(name, email)`)
        .eq("post_id", postId).order("created_at", { ascending: false });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setComments(data);
      }
    }

    fetchPosts();
    fetchComments();
  }, [postId]);

  async function handleSubmit(event) {
    event.preventDefault();
    await supabase.from("comments").insert([
      {
        post_id: postId,
        comment_text: newComments,
        user_id: "947979fc-1baf-4f22-8880-87773136cd46",
      },
    ]);
  }

  async function handleEditSubmit(event) {
    event.preventDefault();
    await supabase
      .from("comments")
      .update({ comment_text: newEditComments })
      .eq("id", postId);
  }

  return (
    <div
      style={{
        backgroundColor: "lightblue",
        color: "black",
        paddingBottom: "35px",
        paddingLeft: "20px",
        paddingTop: "20px",
      }}
    >
      <h1>This is the posts</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <ul>
        {posts?.map(({ id, user_id, post_content, users }) => (
          <li key={id}>
            <h2>{users?.name}</h2>
            <p>{post_content}</p>
            <br />
          </li>
        ))}
      </ul>

      <h2>Comments</h2>
      <ul>
        {comments?.map(({ id, comment_text, users }) => (
          <li key={id}>
            <h3>{users?.name}</h3>
            <p>{comment_text}</p>
            <br />
            {/* ✅ Correct link: uses comment.id */}
            <Link href={`/posts/edit_comments/${id}`}>Edit comment</Link>
          </li>
        ))}
      </ul>

      <br />

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="comment_text"
          placeholder="Write your comment here"
          value={newComments}
          required
          onChange={(e) => setnewComments(e.target.value)}
        />
        <button type="submit">Submit Comment</button>
      </form>

      <br />

      <Link href="/posts">Back to Posts</Link>
    </div>
  );
}
