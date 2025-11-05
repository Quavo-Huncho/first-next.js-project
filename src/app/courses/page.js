"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState(null);
  const [editCourseId, setEditCourseId] = useState(null); // ✅ stores which course is being edited
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 5;

  async function fetchCourses() {
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      const { data, error } = await supabase.from("courses").select("*").order("created_at", {ascending:false}).range(start, end);
      if (error) {
        console.error("Error fetching courses:", error);
      } else {
        setCourses(data);
      }
  }

  async function getUser(){
      const { data, error } = await supabase.auth.getUser(); 
      if(error){
        console.error("Error getting user:", error);
      }else{
        return data.user;
      }
    }


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
  }, [page]);

  const handleDatabaseChange = (payload) => {
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
  };


  async function handleDelete(courseId) {
    const { error } = await supabase.from("courses").delete().eq("id", courseId);

    if (error) {
      setDeleteErrorMsg(error.message);
      setDeleteSuccessMsg(null);
    } else {
      setDeleteSuccessMsg("Course deleted successfully");
      setDeleteErrorMsg(null);
      // Refresh courses
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    }
    setTimeout(() => {
    setSuccessMsg(null);
  }, 3000);
  }

  async function addCourse() {
    const { data, error } = await supabase
      .from("courses")
      .insert([
        {
          title,
          content,
          user_id: null,
        }
      ]).select();

    if (error) {
      setErrorMsg(error.message);
      setSuccessMsg(null);
    } else {
      setSuccessMsg("Course added successfully");
      setErrorMsg(null);
      //setCourses((prev) => [...prev, ...data]);
      setTitle("");
      setContent("");
     
    }
    setTimeout(() => {
    setSuccessMsg(null);
  }, 3000);
  }

  async function editCourseDetails(courseId) {
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

    // ✅ Update the local list — keep order intact
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

//For next page and previous page
  function nextPage() {
      setPage(page + 1);
    }
    function previousPage() {
      setPage(page - 1);
    }
    

  return (
    <div
      style={{
        marginBottom: "10px",
        backgroundColor: "lightblue",
        color: "black",
        padding: "20px",
      }}
    >
      <p style={{ fontSize: "40px", color: "green" }}>These are the courses</p>
      <p style={{ marginBottom: "10px", fontSize: "30px", color: "yellow" }}>
        List of courses:
      </p>

      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            <h2>COURSE TITLE: {course.title}</h2>
            <p><strong>COURSE ID:</strong> {course.id}</p>
            <p><strong>COURSE CONTENT:</strong> {course.content}</p> 

            <button
              onClick={() => {
                setEditCourseId(course.id);
                setTitle(course.title);
                setContent(course.content);
              }}
            >
              Edit Course
            </button><br />
            <button onClick={() => handleDelete(course.id)}>Delete Course</button><br /><br /> 

            {/* ✅ Show edit form only for the selected course */}
            {editCourseId === course.id && (
              <div style={{ marginTop: "10px" }}>
                <h3>Edit Course</h3>
                <input
                  name="title"
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                  placeholder="Enter new title"
                />
                <input
                  name="content"
                  onChange={(e) => setContent(e.target.value)}
                  value={content}
                  placeholder="Enter new content"
                />
                <button onClick={() => editCourseDetails(course.id)}>
                  Submit Edit
                </button>
                <button onClick={() => setEditCourseId(null)}>Cancel</button>
              </div>
            )}
          </li> 
        ))}
      </ul>

      {deleteErrorMsg && <p style={{ color: "red" }}>{deleteErrorMsg}</p>}
      {deleteSuccessMsg && <p style={{ color: "green" }}>{deleteSuccessMsg}</p>}
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

      <h3>Add New Course</h3>
      <input
        name="title"
        onChange={(e) => setTitle(e.target.value)}
        value={title}
        placeholder="Course Title"
      />
      <input
        name="content"
        onChange={(e) => setContent(e.target.value)}
        value={content}
        placeholder="Course Content"
      />
      <button onClick={addCourse}>Submit</button><br/>
      <button onClick={nextPage}>next</button>
      <button onClick={previousPage}>prev</button>
    </div>
  );
}
