"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useCallback } from "react";
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
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 5;

  const fetchPosts = useCallback(async () => {
    if (!postId) return;
    const { data, error } = await supabase
      .from("posts")
      .select(`id, post_content, user_id, users(name, email)`)
      .eq("id", postId);
    if (error) {
      setErrorMsg(error.message);
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data);
      console.log("Posts fetched successfully:", data);
    }
  }, [postId]);

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
      setErrorMsg(error.message);
      console.error("Error fetching comments:", error);
    } else {
      setComments(data);
      console.log("Comments fetched successfully:", data);
    }
  }, [postId, page, limit]);

  const getUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user:", error);
    } else {
      setCurrentUser(data.user);
    }
  }, []);

  useEffect(() => {
    if (!postId) return;

    fetchPosts();
    fetchComments();
    getUser();

    const channel = supabase
      .channel(`comments-changes-${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        async (payload) => {
          console.log('Change received!', payload);

          // Only handle comments for this post
          if (payload.new?.post_id !== postId) return;

          const eventType = payload.eventType?.toUpperCase();

          if (eventType === 'INSERT') {
            const { data, error } = await supabase
              .from('comments')
              .select(`
                id,
                comment_text,
                user_id,
                users(name, email)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('Error fetching inserted comment:', error);
              return;
            }
            if (!data) return;

            setComments((prev) => [data, ...prev]);
          } else if (eventType === 'UPDATE') {
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === payload.new.id ? payload.new : comment
              )
            );
          } else if (eventType === 'DELETE') {
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

  async function handleSubmit(event) {
  event.preventDefault();

  if (!postId || !currentUser) {
    return;
  }

  const { data, error, status } = await supabase
    .from("comments")
    .insert([
      {
        post_id: postId,
        comment_text: newComments,
        user_id: currentUser.id,
      },
    ])
    .select(`
      id,
      comment_text,
      user_id,
      users(name, email)
    `)
    .single(); // optional, gets the inserted row back immediately

  if (error) {
    console.error("❌ Error adding comment:", error);
  } else {
    console.log("✅ Comment added successfully:", data);
    setnewComments(""); // clear input
    fetchComments();
  }
}


  async function handleEditSubmit(event) {
    event.preventDefault();
    if (!postId) return;
    await supabase
      .from("comments")
      .update({ comment_text: newEditComments })
      .eq("id", postId);
  }

//For next page and previous page
  function nextPage() {
      setPage(page + 1);
    }
  function prevPage() {
    setPage(page - 1);
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
      <h1>This is the post</h1>
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

      <h2 className="head">Comments</h2>
      <ul>
        {comments?.map(({ id, comment_text, users }) => (
          <li key={id}>
            <h3>{users?.name}</h3>
            <p>{comment_text}</p>
            {/* ✅ Correct link: uses comment.id */}
            <Link href={`/posts/edit_comments/${id}`}>Edit comment</Link><br /><br />
          </li>
        ))}
      </ul>
        
      <h2 className="sub-head">Add a new comment</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="comment_text"
          placeholder="Write your comment here"
          value={newComments}
          required
          onChange={(e) => setnewComments(e.target.value)}
        />
        <button type="submit" className="add">add comment</button>
      </form>
      <br />
      <button onClick={prevPage}>prev</button>
      <span style={{ margin: '0 5px' }}>page {page}</span>
      <button onClick={nextPage}>next</button>
      <br /><br />
      <Link href="/posts">Back to Posts</Link>
    </div>
  );
}
