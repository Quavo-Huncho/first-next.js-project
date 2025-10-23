"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";
import React from "react";

export default function CoursePage({params}) {
  const [courses, setCourses] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase.from("courses").select("*").eq('user_id', params.id);
      if (error) {
        setErrorMsg(error.message);
        console.error("Error fetching courses:", error);
      }
      else {
        setCourses(data);
        console.log("Courses fetched successfully:", data);
      }
    }
    fetchCourses();
  }, []);

  return (
    <div style={{backgroundColor: 'lightblue', color: 'black', paddingBottom: '307px', paddingLeft: '20px', paddingTop: '20px'}}>

      <h1>This is the courses</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <ul>
        {courses?.map(({ id, title, content }) => (
          <li key={id}>
            <h2>{title}</h2>
            <p>{content}</p>
            <Link href={`/courses/${id}`}>View Course</Link>
          </li>
        ))}
      </ul>
      <Link href="/about">Back to Users</Link>
    </div>
  );
}