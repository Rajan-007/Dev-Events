import Link from "next/link"
import Image from "next/image"

const Navbar = () => {
  return (
    <header>
        <nav>
            <Link href="/" className="logo">
                <Image src="/icons/logo.png" alt="logo" width={50} height={50} className="mr-2" />
                <p>Dev Events</p>
            </Link>

            <ul className="flex gap-4 items-center">
                <li className=" list-none"><Link href="/">Home</Link></li>
                <li className=" list-none"><Link href="/events">Events</Link></li>
                <li className=" list-none"><Link href="/create-event">Create Event</Link></li>
            </ul>

        </nav>
    </header>
  )
}

export default Navbar