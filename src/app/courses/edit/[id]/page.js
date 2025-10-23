"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PostsPage() {
  const [courses, setCourses] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [newCourses, setnewCourses] = useState("");
  const [newTitle, setnewTitle] = useState("");
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id;
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase.from("courses").select(`id, title, content, user_id, users(name, email)`).eq('id', courseId);
      if (error) {
        setErrorMsg(error.message);
        console.error("Error fetching courses:", error);
      } else {
        setCourses(data);
        console.log("Cousess fetched successfully:", data);
      }
    }
    fetchCourses();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await supabase.from("courses").update({content: newCourses}).eq('id', courseId);
    router.push("/courses");
  }

  async function handleTitleSubmit(event) {
    event.preventDefault();
    await supabase.from("courses").update({title: newTitle}).eq('id', courseId);
  }

  function handleTitleChange(event) {
    setnewTitle(event.target.value);
  }

  function handleChange(event) {
    setnewCourses(event.target.value);
  }

  async function handleDelete() {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);
      if (error) {
        setErrorMsg(error.message);
        setSuccessMsg(null);
        console.error("Error deleting course:", error);
      } else {
        setSuccessMsg("Course deleted successfully!");
        setErrorMsg(null);
        console.log("Course deleted successfully");
        router.push("/courses"); // Redirect after deletion
      }
  }

  return (
    <div style={{backgroundColor: 'lightblue', color: 'black', paddingBottom: '334px', paddingLeft: '20px', paddingTop: '20px'}}>
      <h1>This is the course</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
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
      <button onClick={handleDelete}>Delete course</button><br /><br />
      <Link href="/courses">Back to Courses</Link>
    </div>
  );
}