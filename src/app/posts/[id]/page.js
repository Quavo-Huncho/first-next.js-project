"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PostsPage() {
  const params = useParams();
  const postId = params?.id;

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [newComments, setnewComments] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 5;

  // ✅ Fetch post content
  const fetchPosts = useCallback(async () => {
    if (!postId) return;
    const { data, error } = await supabase
      .from("posts")
      .select(`id, post_content, user_id, users(name, email)`)
      .eq("id", postId);

    if (error) {
      console.error("Error fetching posts:", error);
      setErrorMsg(error.message);
    } else {
      setPosts(data);
    }
  }, [postId]);

  // ✅ Fetch paginated comments
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error } = await supabase
      .from("comments")
      .select(`id, comment_text, user_id, users(name, email)`)
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .range(start, end);

    if (error) {
      console.error("Error fetching comments:", error);
      setErrorMsg(error.message);
    } else {
      setComments(data);
    }
  }, [postId, page, limit]);

  // ✅ Get current logged-in user
  const getUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user:", error);
    } else {
      setCurrentUser(data.user);
    }
  }, []);

  // ✅ Realtime subscription for comments
  useEffect(() => {
    if (!postId) return;

    fetchPosts();
    fetchComments();
    getUser();

    const channel = supabase
      .channel(`comments-changes-${postId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        async (payload) => {
          const eventType = payload.eventType?.toUpperCase();

          // Only handle comments for this specific post
          if (payload.new?.post_id !== postId) return;

          // 🔹 Handle INSERT
          if (eventType === "INSERT") {
            const { data, error } = await supabase
              .from("comments")
              .select(`id, comment_text, user_id, users(name, email)`)
              .eq("id", payload.new.id)
              .single();

            if (error) return console.error("Error fetching inserted comment:", error);
            if (!data) return;

            // ✅ Add comment and limit to 5 per page
            setComments((prev) => {
              const updated = [data, ...prev];
              return page === 1 ? updated.slice(0, limit) : updated;
            });
          }

          // 🔹 Handle UPDATE
          else if (eventType === "UPDATE") {
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === payload.new.id
                  ? { ...comment, ...payload.new }
                  : comment
              )
            );
          }

          // 🔹 Handle DELETE
          else if (eventType === "DELETE") {
            setComments((prev) =>
              prev.filter((comment) => comment.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, page, fetchPosts, fetchComments, getUser]);

  // ✅ Add new comment
  async function handleSubmit(event) {
    event.preventDefault();

    if (!postId || !currentUser) return;

    const { error } = await supabase.from("comments").insert([
      {
        post_id: postId,
        comment_text: newComments,
        user_id: currentUser.id,
      },
    ]);

    if (error) {
      console.error("❌ Error adding comment:", error);
      setErrorMsg(error.message);
    } else {
      console.log("✅ Comment added successfully");
      setnewComments(""); // Clear input
    }
  }

  // ✅ Pagination
  function nextPage() {
    setPage((p) => p + 1);
  }
  function prevPage() {
    if (page > 1) setPage((p) => p - 1);
  }

  // ✅ Render UI
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
      <h1>This is the post</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <ul>
        {posts?.map(({ id, post_content, users }) => (
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
            <Link href={`/posts/edit_comments/${id}`}>Edit comment</Link>
            <br />
            <br />
          </li>
        ))}
      </ul>

      <h2>Add a new comment</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="comment_text"
          placeholder="Write your comment here"
          value={newComments}
          required
          onChange={(e) => setnewComments(e.target.value)}
        />
        <button type="submit" className="add">
          Add comment
        </button>
      </form>

      <br />
      <button onClick={prevPage} disabled={page === 1}>
        Prev
      </button>
      <span style={{ margin: "0 8px" }}>Page {page}</span>
      <button onClick={nextPage}>Next</button>

      <br />
      <br />
      <Link href="/posts">Back to Posts</Link>
    </div>
  );
}
