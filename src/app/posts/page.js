"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 5;

   async function fetchPosts() {
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      const { data, error } = await supabase.from("posts").select(`id, post_content, user_id, users(name, email)`).order("created_at", {ascending:false}).range(start, end);
      if (error) {
        setErrorMsg(error.message);
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data);
        console.log("Posts fetched successfully:", data);
      }
    }

     async function getUser(){
      const { data, error } = await supabase.auth.getUser();
      if(error){
        console.error("Error getting user:", error);
      }else{
        setCurrentUser(data.user);
      }
    }
    
  useEffect(() => {

    fetchPosts();
    getUser();

    // Set up real-time subscription to 'posts' table
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
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
  }, [page]);

  const handleDatabaseChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setPosts((prev) => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === payload.new.id ? payload.new : post
        )
      )
    } else if (payload.eventType === 'DELETE') {
      setPosts((prev) =>
        prev.filter((post) => post.id !== payload.old.id)
      )
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await supabase.from("posts").insert([{user_id: currentUser.id, post_content: newPostContent}]);
  }

  function handleChange(event) {
    setNewPostContent(event.target.value);
  }
  
  async function handleDelete(postId) {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if(error) {
        setErrorMsg(error.message);
        setSuccessMsg(null);
      }else{
        setSuccessMsg("Post deleted successfully");
        setErrorMsg(null);
        //setPosts((prev) => prev.filter((c) => c.id !== postId));

        setTimeout(() => {
          setSuccessMsg(null);
        }, 3000);
      }
    }

    function nextPage() {
      setPage(page + 1);
    }

    function previousPage() {
      setPage(page - 1);
    }
  return (
    <div style={{backgroundColor: 'lightblue', color: 'black', padding: '20px'}}>
      <h1>These are the posts</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <ul>
        {posts?.map(({ id, user_id, post_content, users }) => (
          <li key={id}>
            <h2>{users?.name}</h2>
            <p>{post_content}</p>
            <Link href={`/posts/${id}`}>View Post</Link><br />
            <Link href={`/about/posts_id/${user_id}`}>View All Posts by {users?.name}</Link><br />
            <Link href={`/posts/edit_post/${id}`}>Edit Post</Link><br />
            <button type="button" onClick={()=> handleDelete(id)} className="delete">Delete post</button><br /><br />
          </li>
        ))}
      </ul>
      
      <h2 className="sub-head">Add a new post</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="post_content" placeholder="Write your post here" value={newPostContent} required onChange={handleChange}/>
        <button type="submit" className="add">add post</button>
      </form>
      <button onClick={previousPage}>prev</button>
      <span style={{ margin: '0 5px' }}>page {page}</span>
      <button onClick={nextPage}>next</button>
    </div>
  );
}