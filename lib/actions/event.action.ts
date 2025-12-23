"use server"

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

export const GetSimilarEventsBySlug = async (slug: string) => { 
    try {
        await connectDB();

        const event = await Event.findOne({ slug }).lean();
        
        if (!event) return [];
        
        const similarEvents = await Event.find({ 
            _id: { $ne: event._id }, 
            tags: { $in: event.tags } 
        }).limit(3).sort({ createdAt: -1 }).lean();

        // Serialize MongoDB objects to plain JSON for client components
        return JSON.parse(JSON.stringify(similarEvents));
    } catch (error) {
        console.error(error);
        return [];
    }
} 

export const GetAllEvents = async () => {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 }).lean();

        // Serialize MongoDB objects to plain JSON for client components
        return JSON.parse(JSON.stringify(events));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export const GetEventBySlug = async (slug: string) => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug }).lean();

        if (!event) return null;

        // Serialize MongoDB objects to plain JSON for client components
        return JSON.parse(JSON.stringify(event));
    } catch (error) {
        console.error(error);
        return null;
    }
}