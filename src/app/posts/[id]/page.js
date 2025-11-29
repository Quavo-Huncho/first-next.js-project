"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";

export default function PostsPage() {
  const params = useParams();
  const postId = params?.id;

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [newComments, setNewComments] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(1);
  const [pageArray, setPageArray] = useState([]);

  const limit = 5;

  // Fetch post
  const fetchPosts = useCallback(async () => {
    if (!postId) return;
    const { data, error } = await supabase
      .from("posts")
      .select(`id, post_content, user_id, users(name, email)`)
      .eq("id", postId);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setPosts(data);
    }
  }, [postId]);

  // Fetch paginated comments
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
    } else {
      setComments(data);
    }
  }, [postId, page]);

  // Get user
  const getUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (!error) setCurrentUser(data.user);
  }, []);

  // Count pages
  const getCount = async () => {
    const { count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (!error) {
      const totalPages = Math.ceil(count / limit);
      setPageArray(Array.from({ length: totalPages }, (_, i) => i + 1));
    }
  };

  // Realtime updates
  useEffect(() => {
    if (!postId) return;

    fetchPosts();
    fetchComments();
    getUser();
    getCount();

    const channel = supabase
      .channel(`comments-changes-${postId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => fetchComments()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [postId, page]);

  // Submit comment
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
      setErrorMsg(error.message);
    } else {
      setNewComments("");
      fetchComments();
    }
  }

  //Delete comment
  async function handleDelete(commentId) {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      setErrorMsg(error.message);
    } else {
      fetchComments();
    }
  }


  // Pagination
  function nextPage() {
    if (page < pageArray.length) setPage(page + 1);
  }
  function prevPage() {
    if (page > 1) setPage(page - 1);
  }
  function anyPage(p) {
    setPage(Number(p));
  }

  if (!posts.length) return <Loading />;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Post Details
          </h1>
          <p className="text-xl text-white/80">
            View the post and join the discussion
          </p>
        </motion.div>

        {errorMsg && (
          <Alert message={errorMsg} type="error" onClose={() => setErrorMsg(null)} />
        )}

        {/* POST CARD */}
        {posts.map(({ id, post_content, users }) => (
          <Card key={id} className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {users?.name}
            </h2>
            <p className="text-gray-500 text-sm">{users?.email}</p>
            <p className="text-gray-700 mt-4 whitespace-pre-line">
              {post_content}
            </p>
          </Card>
        ))}

        {/* COMMENTS */}
        <h2 className="text-3xl font-bold text-white mb-6">Comments</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {comments.map(({ id, comment_text, users }, index) => (
            <Card key={id} delay={index * 0.1}>
              <h3 className="text-xl font-bold text-gray-800">{users?.name}</h3>
              <p className="text-gray-500 text-sm mb-3">{users?.email}</p>
              <p className="text-gray-700 mb-4">{comment_text}</p>

              <Link href={`/posts/edit_comments/${id}`}>
                <Button variant="success" className="text-sm px-4 py-2">
                  Edit Comment
                </Button>
              </Link>
              <Button
                variant="danger"
                className="text-sm px-4 py-2 ml-2"
                onClick={() => handleDelete(id)}
              >
                Delete Comment
              </Button>
            </Card>
          ))}
        </div>

        {/* Add Comment */}
        <Card className="mt-10 mb-14">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Add a Comment
          </h2>

          {currentUser ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                name="comment_text"
                placeholder="Write your comment..."
                value={newComments}
                onChange={(e) => setNewComments(e.target.value)}
                className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              />
              <div className="flex justify-end">
                <Button type="submit" variant="primary">
                  Add Comment
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600">
              Please{" "}
              <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                sign in
              </Link>{" "}
              to comment.
            </p>
          )}
        </Card>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-10">
          <Button onClick={prevPage} disabled={page === 1} variant="secondary">
            Previous
          </Button>

          <span className="text-white font-semibold text-lg bg-white/10 px-6 py-2 rounded-lg">
            Page {page}
          </span>

          {pageArray.map((p) => (
            <button
              key={p}
              value={p}
              onClick={(e) => anyPage(e.target.value)}
              className={`px-3 py-1 rounded ${
                page === p
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              {p}
            </button>
          ))}

          <Button
            onClick={nextPage}
            disabled={page === pageArray.length}
            variant="secondary"
          >
            Next
          </Button>
        </div>

        <div className="mt-10 text-center">
          <Link href="/posts">
            <Button variant="secondary">Back to Posts</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
