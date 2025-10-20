"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PostsPage({params}) {
  const [courses, setCourses] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [newCourses, setnewCourses] = useState("");
  const [newTitle, setnewTitle] = useState("");
  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase.from("courses").select(`id, title, content, user_id, users(name, email)`).eq('id', params.id);
      if (error) {
        setErrorMsg(error.message);
        console.error("Error fetching posts:", error);
      } else {
        setCourses(data);
        console.log("Cousess fetched successfully:", data);
      }
    }
    fetchCourses();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await supabase.from("courses").update({content: newCourses}).eq('id', params.id);
  }

  async function handleTitleSubmit(event) {
    event.preventDefault();
    await supabase.from("courses").update({title: newTitle}).eq('id', params.id);
  }

  function handleTitleChange(event) {
    setnewTitle(event.target.value);
  }

  function handleChange(event) {
    setnewCourses(event.target.value);
  }

  return (
    <div style={{backgroundColor: 'lightblue', color: 'black', paddingBottom: '334px', paddingLeft: '20px', paddingTop: '20px'}}>
      <h1>This is the course</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <ul>
        {courses?.map(({ id, user_id, content, title }) => (
          <li key={id}>
            <h2>{title}</h2>
            <p>{content}</p>
          </li>
        ))}
      </ul> <br />
      <form onSubmit={handleTitleSubmit}>
        <input type="text" name="title" placeholder="Edit your course title here" value={newTitle} required onChange={handleTitleChange}/>
        <button type="submit">Submit Edit</button>
      </form>

      <form onSubmit={handleSubmit}>
        <input type="text" name="content" placeholder="Edit your course here" value={newCourses} required onChange={handleChange}/>
        <button type="submit">Submit Edit</button>
      </form><br />
      <Link href="/courses">Back to Courses</Link>
    </div>
  );
}