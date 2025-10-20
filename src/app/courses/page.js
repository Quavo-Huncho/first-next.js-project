"use client";
import {supabase} from "@/lib/supabase";
import { useState, useEffect } from "react";
import SignupButton from "@/components/signup";
import Link from "next/link";


export default function CoursePage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select('*');
        if (error) {
          console.error("Error fetching courses:", error);
        }else {
          setCourses(data);
        }
      }
        fetchCourses();
  }, []);
  return(
    <div style={{marginBottom: '10px', backgroundColor: 'lightblue', color: 'black', padding: '20px'}}>
      <p style={{fontSize: '40px', color: 'green'}}>These are the courses</p> <br />
      <p style={{marginBottom: '10px', fontSize: '30px', color:'yellow'}}>List of courses:</p>
      <ul>
        {courses.map(course => (
          <li key={course.id}>
            <h2>COURSE TITLT: {course.title}</h2>
            <p>COURSE ID: {course.id}</p>
            <p>COURSE CONTENT: {course.content}</p>
            <Link href={`/courses/${course.id}`}>View Course</Link> <br /><br />      
            <Link href={`/courses/edit/${course.id}`}>edit Course</Link> <br /><br />      
          </li>
        ))}
      </ul>
    </div>
  )
}