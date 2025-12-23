'use client';

import { useState, FormEvent, ChangeEvent, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface FormData {
    title: string;
    description: string;
    overview: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string;
    organizer: string;
    tags: string;
    image: File | null;
}

const CreateEventForm = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        overview: '',
        venue: '',
        location: '',
        date: '',
        time: '',
        mode: 'offline',
        audience: '',
        agenda: '',
        organizer: '',
        tags: '',
        image: null,
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const processImageFile = (file: File) => {
        setFormData(prev => ({ ...prev, image: file }));
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processImageFile(file);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processImageFile(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const submitData = new FormData();
            
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('overview', formData.overview);
            submitData.append('venue', formData.venue);
            submitData.append('location', formData.location);
            submitData.append('date', formData.date);
            submitData.append('time', formData.time);
            submitData.append('mode', formData.mode);
            submitData.append('audience', formData.audience);
            submitData.append('organizer', formData.organizer);
            
            const agendaArray = formData.agenda.split(',').map(item => item.trim()).filter(Boolean);
            const tagsArray = formData.tags.split(',').map(item => item.trim()).filter(Boolean);
            
            submitData.append('agenda', JSON.stringify(agendaArray));
            submitData.append('tags', JSON.stringify(tagsArray));
            
            if (formData.image) {
                submitData.append('image', formData.image);
            }

            const response = await fetch('/api/events', {
                method: 'POST',
                body: submitData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create event');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/events/${result.event.slug}`);
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="create-event-form w-full">
            {error && (
                <div className="error-message">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {success && (
                <div className="success-message">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Event created successfully! Redirecting...</span>
                    </div>
                </div>
            )}

            {/* Basic Information Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon">📝</div>
                    <div>
                        <h3 className="section-title">Basic Information</h3>
                        <p className="section-subtitle">Tell us about your event</p>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="title">Event Title *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., React Summit 2025"
                        required
                        maxLength={100}
                    />
                    <span className="char-count">{formData.title.length}/100</span>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Provide a comprehensive description of your event. What makes it special?"
                        required
                        maxLength={1000}
                        rows={4}
                    />
                    <span className="char-count">{formData.description.length}/1000</span>
                </div>

                <div className="form-group">
                    <label htmlFor="overview">Quick Overview *</label>
                    <textarea
                        id="overview"
                        name="overview"
                        value={formData.overview}
                        onChange={handleInputChange}
                        placeholder="A brief one-liner about the event"
                        required
                        maxLength={500}
                        rows={2}
                    />
                    <span className="char-count">{formData.overview.length}/500</span>
                </div>
            </div>

            {/* Location & Schedule Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon">📍</div>
                    <div>
                        <h3 className="section-title">Location & Schedule</h3>
                        <p className="section-subtitle">When and where will it happen?</p>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="venue">Venue Name *</label>
                        <input
                            type="text"
                            id="venue"
                            name="venue"
                            value={formData.venue}
                            onChange={handleInputChange}
                            placeholder="e.g., Tech Convention Center"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">City, Country *</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="e.g., San Francisco, USA"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="date">Event Date *</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="time">Start Time *</label>
                        <input
                            type="time"
                            id="time"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="mode">Event Mode *</label>
                        <select
                            id="mode"
                            name="mode"
                            value={formData.mode}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="offline">🏢 In-person (Offline)</option>
                            <option value="online">💻 Virtual (Online)</option>
                            <option value="hybrid">🌐 Hybrid (Both)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="audience">Target Audience *</label>
                        <input
                            type="text"
                            id="audience"
                            name="audience"
                            value={formData.audience}
                            onChange={handleInputChange}
                            placeholder="e.g., Senior Developers, Students, All Levels"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Event Details Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon">🎯</div>
                    <div>
                        <h3 className="section-title">Event Details</h3>
                        <p className="section-subtitle">Additional information</p>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="organizer">Organizer *</label>
                    <input
                        type="text"
                        id="organizer"
                        name="organizer"
                        value={formData.organizer}
                        onChange={handleInputChange}
                        placeholder="e.g., Google Developers Group, Microsoft"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="agenda">Event Agenda * <span className="text-xs text-gray-400">(comma-separated)</span></label>
                    <textarea
                        id="agenda"
                        name="agenda"
                        value={formData.agenda}
                        onChange={handleInputChange}
                        placeholder="Opening keynote, Technical workshops, Lightning talks, Networking session, Closing ceremony"
                        required
                        rows={3}
                    />
                    <p className="help-text">List the main activities planned for your event</p>
                </div>

                <div className="form-group">
                    <label htmlFor="tags">Event Tags * <span className="text-xs text-gray-400">(comma-separated)</span></label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="React, JavaScript, Web Development, AI, Cloud"
                        required
                    />
                    <p className="help-text">Add relevant tags to help attendees find your event</p>
                </div>
            </div>

            {/* Event Image Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon">🖼️</div>
                    <div>
                        <h3 className="section-title">Event Image</h3>
                        <p className="section-subtitle">Upload a captivating banner</p>
                    </div>
                </div>

                <div className="form-group">
                    <div 
                        className={`image-upload-area ${isDragging ? 'dragging' : ''} ${imagePreview ? 'has-image' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {imagePreview ? (
                            <div className="image-preview-container group">
                                <Image src={imagePreview} alt="Event preview" width={800} height={400} className="uploaded-image" />
                                <button 
                                    type="button" 
                                    className="change-image-btn"
                                    onClick={() => document.getElementById('image')?.click()}
                                >
                                    Change Image
                                </button>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="upload-title">Drop your image here or click to browse</p>
                                <p className="upload-subtitle">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        )}
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleImageChange}
                            accept="image/*"
                            required
                            className="hidden"
                        />
                    </div>
                </div>
            </div>

            <button 
                type="submit" 
                className="button-submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating Your Event...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Event
                    </span>
                )}
            </button>
        </form>
    );
};

export default CreateEventForm;
