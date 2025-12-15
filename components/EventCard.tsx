'use client'
import Image from "next/image"
import Link from "next/link"

interface Props {
    title: string;
    image: string;
    slug: string;
    location: string;
    date: string;
    time: string;
}

const EventCard = ({title,image,slug,location,date,time}:Props) => {
  return (
    <Link href={`/events/${slug}`} className="event-card">
        <Image src={image} alt={title} width={410} height={300} className="poster" />
        <div className="flex gap-2 ">
            <Image src="/icons/pin.svg" alt="pin" width={24} height={24} />
            <p>{location}</p>
        </div>
        <p className="title">{title}</p>
        
        <div className="datetime">
            <div className="flex gap-2 ">
                <Image src="/icons/calendar.svg" alt="calendar" width={24} height={24} />
                <p>{date}</p>
            </div>
            <div className="flex gap-2 ">
                <Image src="/icons/clock.svg" alt="clock" width={24} height={24} />
                <p>{time}</p>
            </div>
        </div>
        
    </Link>
  )
}

export default EventCard