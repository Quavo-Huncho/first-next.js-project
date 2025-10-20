
"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CoursePage({ params }) {
  const [course, setCourse] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchCourse() {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, content, user_id, registered_users, users(name, email)")
        .eq("id", params.id)
        .single(); // ✅ get single course

      if (error) {
        setErrorMsg(error.message);
        console.error("Error fetching course:", error);
        return;
      }

      setCourse(data);
      console.log("Course fetched:", data);

      // ✅ Safely extract registered users from JSONB
      const userList = data?.registered_users?.[0]?.userss || [];
      setUsers(userList);
      console.log("Registered users fetched:", userList);
    }

    fetchCourse();
  }, [params.id]);

  return (
    <div style={{backgroundColor: 'lightblue', color: 'black', paddingBottom: '346px', paddingLeft: '20px', paddingTop: '20px'}}>
      <h1>Course Details</h1>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      {course ? (
        <>
          <h2>{course.title}</h2>
          <p>{course.content}</p>

          <h3>Registered Users:</h3>
          {users.length > 0 ? (
            <ul>
              {users.map((user , id) => (
                <li key={id}>{typeof user === "object" ? user.name : user}</li>
              ))}
            </ul>
          ) : (
            <p>No registered users yet.</p>
          )}
        </>
      ) : (
        <p>Loading course...</p>
      )}

      <Link href="/courses">⬅ Back to Courses</Link>
    </div>
  );
}
