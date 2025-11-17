"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const limit = 5;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    const { data, error } = await supabase.from("posts").select(`id, post_content, user_id, users(name, email)`).order("created_at", {ascending:false}).range(start, end);
    if (error) {
      setErrorMsg(error.message);
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data);
    }
    setLoading(false);
  }, [page, limit]);

  const getUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if(error){
      console.error("Error getting user:", error);
    }else{
      setCurrentUser(data.user);
    }
  }, []);

  const handleDatabaseChange = useCallback((payload) => {
    // Refresh list to maintain joined user metadata
    fetchPosts();
  }, [fetchPosts]);
    
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
  }, [fetchPosts, getUser, handleDatabaseChange]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!currentUser) {
      setErrorMsg("You must be signed in to post.");
      return;
    }
    if (!newPostContent.trim()) {
      setErrorMsg("Post content is required.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from("posts")
      .insert([{ user_id: currentUser.id, post_content: newPostContent.trim() }]);

    if (error) {
      setErrorMsg(error.message);
      setSuccessMsg(null);
    } else {
      setSuccessMsg("Post created successfully");
      fetchPosts();
      setErrorMsg(null);
      setNewPostContent("");
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    }

    setSubmitting(false);
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
        fetchPosts();
        setErrorMsg(null);
        setPosts((prev) => prev.filter((c) => c.id !== postId));

        setTimeout(() => {
          setSuccessMsg(null);
        }, 3000);
      }
    }

    function nextPage() {
      setPage(page + 1);
    }

    function previousPage() {
      if (page > 1) {
        setPage(page - 1);
      }
    }
  if (loading && posts.length === 0) {
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
        <img src="https://wwlidnafgkovirwgieka.supabase.co/storage/v1/object/public/posts/12V-DC-to-220V-AC-Inverter%20CCT%20Diagram%202.jpg"/>
          <h1 className="text-5xl font-bold text-white mb-4">Community Posts</h1>
          <p className="text-xl text-white/80">Share updates and connect with other learners</p>
        </motion.div>

        {errorMsg && <Alert message={errorMsg} type="error" onClose={() => setErrorMsg(null)} />}
        {successMsg && <Alert message={successMsg} type="success" onClose={() => setSuccessMsg(null)} />}

        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Create a Post</h2>
          {currentUser ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                name="post_content"
                placeholder="Write something inspiring..."
                value={newPostContent}
                onChange={handleChange}
                className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              />
              <div className="flex justify-end">
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? "Posting..." : "Share Post"}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600">
              Please <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">sign in</Link> to share a post.
            </p>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {posts?.map(({ id, user_id, post_content, users }, index) => {
            const authorName = users?.name ?? "Unknown user";
            return (
              <Card key={id} delay={index * 0.1}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{authorName}</h3>
                    <p className="text-sm text-gray-500">{users?.email}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Post #{id}</span>
                </div>
                <p className="text-gray-700 mb-6 whitespace-pre-line">{post_content}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/posts/${id}`}>
                    <Button variant="secondary" className="text-sm px-4 py-2">
                      View Post
                    </Button>
                  </Link>
                  <Link href={`/about/posts_id/${user_id}`}>
                    <Button variant="secondary" className="text-sm px-4 py-2">
                      View Author Posts
                    </Button>
                  </Link>
                  <Link href={`/posts/edit_post/${id}`}>
                    <Button variant="success" className="text-sm px-4 py-2">
                      Edit Post
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    onClick={() => handleDelete(id)}
                    variant="danger"
                    className="text-sm px-4 py-2"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {posts?.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-white/80 text-xl">No posts yet. Be the first to share something!</p>
          </div>
        )}

        <div className="flex justify-center items-center gap-4 mt-10">
          <Button onClick={previousPage} disabled={page === 1} variant="secondary">
            Previous
          </Button>
          <span className="text-white font-semibold text-lg bg-white/10 px-6 py-2 rounded-lg">
            Page {page}
          </span>
          <Button onClick={nextPage} disabled={posts.length < limit} variant="secondary">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}