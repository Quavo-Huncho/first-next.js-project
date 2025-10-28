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

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase.from("courses").select("*");
      if (error) {
        console.error("Error fetching courses:", error);
      } else {
        setCourses(data);
      }
    }
    fetchCourses();
  }, []);

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
      setCourses((prev) => [...prev, ...data]);
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
      <button onClick={addCourse}>Submit</button>
    </div>
  );
}
