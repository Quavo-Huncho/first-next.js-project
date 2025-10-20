import Link from "next/link"

export default function NavBar() {
  return (
    <div>
      <div style={{display: 'flex', backgroundColor: 'black', color: 'red', paddingBottom: '30px', paddingTop: '30px', paddingLeft:'10px', gap: '550px'}}>
        <button style={{all: 'unset', color: 'inherit', cursor: 'pointer'}}><Link href={"/"}>HOME</Link></button>
        <button style={{all: 'unset', color: 'inherit', cursor: 'pointer'}}><Link href={"/about"}>USERS</Link></button>
        <button style={{all: 'unset', color: 'inherit', cursor: 'pointer'}}><Link href={"/courses"}>COURSES</Link></button>
      </div>
    </div>
  )
}