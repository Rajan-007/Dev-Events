import CreateEventForm from "@/components/CreateEventForm";

const CreateEventPage = () => {
    return (
        <section className="py-10 w-[70%] mx-auto">
            <div className="text-center mb-10">
                <h1>Create New Event</h1>
                <p className="text-gray-400 mt-2">Fill in the details below to create your event</p>
            </div>
            
            <CreateEventForm />
        </section>
    );
};

export default CreateEventPage;
