"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";
import React from "react";

export default function AllPages({params}) {
  const [users, setUsers] = useState(null);
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const { id } = React.use(params);

  useEffect(() => {
    async function fetchAllDetails() {
      const { data: userData, error: userError } = await supabase.from("users").select("*").eq('id', id);
      if (userError) {
        setErrorMsg(userError.message);
        console.error("Error fetching users:", userError);
      }
      else {
        setUsers(userData);
        console.log("Users fetched successfully:", userData);
      }

      const { data: courseData, error: courseError } = await supabase.from("courses").select("*").eq('user_id', id);
      if (courseError) {
        setErrorMsg(courseError.message);
        console.error("Error fetching courses:", courseError);
      } else {
        setCourses(courseData);
        console.log("Courses fetched successfully:", courseData);
      }
      const { data: postData, error: postError } = await supabase.from("posts").select("*").eq('user_id', id);
      if (postError) {
        setErrorMsg(postError.message);
        console.error("Error fetching posts:", postError);
      } else {
        setPosts(postData);
        console.log("Posts fetched successfully:", postData);
      }

    }
    fetchAllDetails();
  }, [id]);

  return (
    <div style={{backgroundColor: 'lightblue', color: 'black', paddingBottom: '151px', paddingLeft: '20px', paddingTop: '20px'}}>
      <h1>These are the details</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <ul>
        {users?.map(({ id, name, email }) => (
          <li key={id}>
            <h2>NAME: {name}</h2>
            <p>EMAIL: {email}</p><br />
          </li>
        ))}
      </ul>
      <ul>
        <h2>User&apos;s courses</h2>
        {courses?.map(({ id, title, content }) => (
          <li key={id}>
            <h2>COURSE TITLE: {title}</h2>
            <p>COURSE CONTENT: {content}</p><br />
          </li>
        ))}
      </ul>
      <ul>
        <h2>User&apos;s Posts</h2>
        {posts?.map(({ id, post_content }) => (
          <li key={id}>

            <p>POST CONTENT: {post_content}</p><br />
          </li>
        ))}
      </ul>
      <Link href="/about">Back to Users</Link>
    </div>
  );
}

