"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";

export default function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [editCourseId, setEditCourseId] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const limit = 5;

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    const { data, error } = await supabase.from("courses").select("*").order("created_at", {ascending:false}).range(start, end);
    if (error) {
      console.error("Error fetching courses:", error);
      setErrorMsg("Failed to fetch courses");
    } else {
      setCourses(data);
    }
    setLoading(false);
  }, [page, limit]);

  const getUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser(); 
    if(error){
      console.error("Error getting user:", error);
    } else {
      setCurrentUser(data.user);
    }
    return data?.user ?? null;
  }, []);

  const handleDatabaseChange = useCallback((payload) => {
    if (payload.eventType === 'INSERT') {
      setCourses((prev) => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setCourses((prev) =>
        prev.map((course) =>
          course.id === payload.new.id ? payload.new : course
        )
      )
    } else if (payload.eventType === 'DELETE') {
      setCourses((prev) =>
        prev.filter((course) => course.id !== payload.old.id)
      )
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    getUser();

    // Set up real-time subscription to 'posts' table
    const channel = supabase
      .channel('courses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses' },
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
  }, [page, fetchCourses, getUser, handleDatabaseChange]);


  async function handleDelete(courseId) {
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) {
      setErrorMsg(error.message);
      setSuccessMsg(null);
    } else {
      setSuccessMsg("Course deleted successfully");
      fetchCourses();
      setErrorMsg(null);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    }
  }

  async function addCourse() {
    if (!title.trim() || !content.trim()) {
      setErrorMsg("Title and content are required");
      return;
    }
    const { data, error } = await supabase
      .from("courses")
      .insert([{ title, content, user_id: currentUser ? currentUser.id : null }])
      .select();

    if (error) {
      setErrorMsg(error.message);
      setSuccessMsg(null);
    } else {
      setSuccessMsg("Course added successfully");
      fetchCourses();
      setErrorMsg(null);
      setTitle("");
      setContent("");
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    }
  }

  async function editCourseDetails(courseId) {
    if (!title.trim() || !content.trim()) {
      setErrorMsg("Title and content are required");
      return;
    }
    const { error } = await supabase
      .from("courses")
      .update({ title: title, content: content })
      .eq("id", courseId);

    if (error) {
      setErrorMsg(error.message);
      setSuccessMsg(null);
    } else {
      setSuccessMsg("Course edited successfully");
      setErrorMsg(null);
      setEditCourseId(null);
      setTitle("");
      setContent("");
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId
            ? { ...course, title: title, content: content }
            : course
        )
      );
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

  function handleCancelEdit() {
    setEditCourseId(null);
    setTitle("");
    setContent("");
  }

  if (loading && courses.length === 0) {
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
          <h1 className="text-5xl font-bold text-white mb-4">Course Library</h1>
          <p className="text-xl text-white/80">Explore and manage your courses</p>
        </motion.div>

        {errorMsg && <Alert message={errorMsg} type="error" onClose={() => setErrorMsg(null)} />}
        {successMsg && <Alert message={successMsg} type="success" onClose={() => setSuccessMsg(null)} />}

        {/* Add Course Form */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Course</h2>
          <div className="space-y-4 mb-4">
            <Input
              name="title"
              placeholder="Course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              name="content"
              placeholder="Course content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <Button onClick={addCourse} variant="success">Add Course</Button>
        </Card>

        {/* Courses List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {courses.map((course, index) => (
            <Card key={course.id} delay={index * 0.1}>
              {editCourseId === course.id ? (
                <div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Course</h3>
                  <div className="space-y-3 mb-4">
                    <Input
                      name="title"
                      placeholder="Course title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                      name="content"
                      placeholder="Course content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => editCourseDetails(course.id)} variant="success" className="flex-1">
                      Save
                    </Button>
                    <Button onClick={handleCancelEdit} variant="secondary" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-2xl font-bold text-gray-800">{course.title}</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">ID: {course.id}</span>
                    </div>
                    <p className="text-gray-600">{course.content}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditCourseId(course.id);
                        setTitle(course.title);
                        setContent(course.content);
                      }}
                      variant="success"
                      className="flex-1 text-sm py-2 px-3"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(course.id)}
                      variant="danger"
                      className="flex-1 text-sm py-2 px-3"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {courses.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-white/80 text-xl">No courses found. Add your first course above!</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            onClick={previousPage}
            disabled={page === 1}
            variant="secondary"
          >
            Previous
          </Button>
          <span className="text-white font-semibold text-lg bg-white/10 px-6 py-2 rounded-lg">
            Page {page}
          </span>
          <Button
            onClick={nextPage}
            disabled={courses.length < limit}
            variant="secondary"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
