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

            <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/events">Events</Link></li>
                <li><Link href="/create-event">Create Event</Link></li>
            </ul>

        </nav>
    </header>
  )
}

export default Navbar