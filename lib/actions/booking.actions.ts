"use server"

import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";
import Event from "@/database/event.model";

interface CreateBookingParams {
  eventId: string;
  slug: string;
  email: string;
}

export const createBooking = async ({ eventId, slug, email }: CreateBookingParams) => {
  try {
    await connectDB();

    // First check if the event exists
    const event = await Event.findOne({ 
      $or: [
        { _id: eventId },
        { slug: slug }
      ]
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // Check if booking already exists for this email and event
    const existingBooking = await Booking.findOne({
      eventId: event._id,
      email: email.toLowerCase().trim(),
    });

    if (existingBooking) {
      return { success: false, error: "You have already booked this event" };
    }

    // Create the booking
    const booking = await Booking.create({
      eventId: event._id,
      email: email.toLowerCase().trim(),
    });

    return { success: true, booking: JSON.parse(JSON.stringify(booking)) };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: "Failed to create booking" };
  }
};
