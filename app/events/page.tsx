import EventCard from "@/components/EventCard";
import {IEvent} from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventsPage = async () => {
    const response = await fetch(`${BASE_URL}/api/events`, {
        next: { revalidate: 60 }
    });
    const { events } = await response.json();

    return (
        <section className="py-10">
            <h1 className="text-center mb-4">All Events</h1>
            <p className="text-center mb-10 text-gray-400">Discover hackathons, meetups, and conferences happening near you</p>

            <div className="events">
                {events && events.length > 0 ? (
                    events.map((event: IEvent) => (
                        <EventCard 
                            key={String(event._id)} 
                            title={event.title}
                            image={event.image}
                            slug={event.slug}
                            location={event.location}
                            date={event.date}
                            time={event.time}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-400">No events found. Be the first to create one!</p>
                )}
            </div>
        </section>
    )
}

export default EventsPage;
