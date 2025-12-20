import { Schema, model, models, Document, Model, Types } from 'mongoose';
import { Event } from './event.model';

export interface BookingAttrs {
  eventId: Types.ObjectId;
  email: string;
}

export interface BookingDocument extends BookingAttrs, Document {
  createdAt: Date;
  updatedAt: Date;
}

export type BookingModel = Model<BookingDocument>;

// Simple but strict-ish email regex suitable for backend validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true, // index for faster queries by event
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => emailRegex.test(value),
        message: 'Email must be a valid email address.',
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Pre-save hook: validate referenced event and email format.
BookingSchema.pre<BookingDocument>('save', async function preSave(next) {
  try {
    // Only verify event reference when it is new or modified.
    if (this.isNew || this.isModified('eventId')) {
      const exists = await Event.exists({ _id: this.eventId });
      if (!exists) {
        this.invalidate('eventId', 'Referenced event does not exist.');
      }
    }

    if (!emailRegex.test(this.email)) {
      this.invalidate('email', 'Email must be a valid email address.');
    }

    next();
  } catch (err) {
    next(err as Error);
  }
});

export const Booking: BookingModel = (models.Booking as BookingModel) || model<BookingDocument, BookingModel>('Booking', BookingSchema);
