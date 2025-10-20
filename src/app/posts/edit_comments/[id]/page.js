
"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function EditCommentsPage() {
  const params = useParams();
  const commentId = params?.id; // ✅ safer access

  const [commentText, setCommentText] = useState("");
  const [commentTexts, setCommentTexts] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    // ✅ only fetch if commentId exists
    if (!commentId) return;

    async function fetchComment() {
      const { data, error } = await supabase
        .from("comments")
        .select("id, comment_text")
        .eq("id", commentId)
        .single();

      if (error) {
        setErrorMsg(error.message);
        console.error("Error fetching comment:", error);
      } else {
        setCommentText(data.comment_text);
        setCommentTexts(data.comment_text);
        console.log("Comment fetched successfully:", data);
      }
    }

    fetchComment();
  }, [commentId]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!commentId) {
      setErrorMsg("Missing comment ID.");
      return;
    }

    const { error } = await supabase
      .from("comments")
      .update({ comment_text: commentText })
      .eq("id", commentId);

    if (error) {
      setErrorMsg(error.message);
      setSuccessMsg(null);
      console.error("Error updating comment:", error);
    } else {
      setSuccessMsg("Comment updated successfully!");
      setErrorMsg(null);
      console.log("Comment updated successfully");
    }
  }

  return (
    <div style={{ backgroundColor: "lightblue", color: "black", padding: "20px" }}>
      <h1>Edit Comment</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

      {!commentId ? (
        <p>Loading comment ID...</p> // ✅ avoids fetching with undefined id
      ) : (
        <form onSubmit={handleSubmit}>
        <h3>{commentTexts}</h3>
          <textarea
            name="comment_text"
            onChange={(e) => setCommentText(e.target.value)}
            rows="4"
            cols="50"
            required
          />
          <br />
          <button type="submit">Update Comment</button>
        </form>
      )}

      <br />
      <Link href="/posts">Back to Posts</Link>
    </div>
  );
}
