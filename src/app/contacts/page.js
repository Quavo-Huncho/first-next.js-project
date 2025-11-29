"use client"
import {useState, useEffect} from "react"
import {supabase} from "@/lib/supabase"


export default function contact(){
  const [contacts, setContacts] = useState([])
  const [user, setUser] = useState([])
  
  useEffect(() => {
    const getUser = async () => {
      const {data, error} = await supabase.auth.getUser() 
      if(error){
        console.error("Error getting user:", error)
      } else {
        setUser(data.user)
        console.log(data.user.id)
      } 
    }
    
    const fetchContacts = async () => {
    const {data, error} = await supabase.from("contacts").select("*").eq("user_id", user.id)
    if(error){
      console.error("Error fetching contacts:", error)
    } else {
      setContacts(data)
      console.log(data)
    }
  }
  getUser()
  fetchContacts()
  }, []);
  
  return(
    <div>
      <h1>This is the contact page</h1>
      {contacts.map((contact) => (
        <div key={contact.id}>
          <h2>{contact.tiktok}</h2>
          <p>{contact.snapchat}</p>
        </div>
      ))}
    </div>
  )
}