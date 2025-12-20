import { Schema, model, models, Document, Model } from 'mongoose';

// Shape of data required to create an Event
export interface EventAttrs {
  title: string;
  slug?: string; // auto-generated from title
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as normalized ISO date string (YYYY-MM-DD)
  time: string; // stored as 24h time string (HH:mm)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

// Event document as stored in MongoDB
export interface EventDocument extends EventAttrs, Document {
  createdAt: Date;
  updatedAt: Date;
}

export type EventModel = Model<EventDocument>;

// Helper that converts a title into a URL-friendly slug
const slugify = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumerics with dashes
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes

// Normalize a date string into ISO `YYYY-MM-DD` format
const normalizeDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date format; expected a value parsable by Date.');
  }

  // ISO date part only (no time component)
  return date.toISOString().slice(0, 10);
};

// Normalize time into 24h `HH:mm` format
const normalizeTime = (value: string): string => {
  const trimmed = value.trim();

  // Accept `HH:mm` or `H:mm` with optional seconds and am/pm, then normalize.
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i;
  const match = trimmed.match(timeRegex);

  if (!match) {
    throw new Error('Invalid time format; expected HH:mm (optionally with seconds and am/pm).');
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[4]?.toLowerCase();

  if (minutes < 0 || minutes > 59) {
    throw new Error('Invalid time: minutes must be between 00 and 59.');
  }

  if (meridiem) {
    if (hours < 1 || hours > 12) {
      throw new Error('Invalid time: hour must be between 1 and 12 when using am/pm.');
    }
    if (meridiem === 'pm' && hours !== 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
  }

  if (!meridiem && (hours < 0 || hours > 23)) {
    throw new Error('Invalid time: hour must be between 0 and 23.');
  }

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');

  return `${hh}:${mm}`;
};

const requiredString = {
  type: String,
  required: true,
  trim: true,
} as const;

const EventSchema = new Schema<EventDocument, EventModel>(
  {
    title: requiredString,
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true, // unique index to guarantee slug uniqueness
      trim: true,
    },
    description: requiredString,
    overview: requiredString,
    image: requiredString,
    venue: requiredString,
    location: requiredString,
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    mode: requiredString,
    audience: requiredString,
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Agenda must contain at least one entry.',
      },
    },
    organizer: requiredString,
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Tags must contain at least one entry.',
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Pre-save hook: validate required strings, normalize date/time, and generate slug.
EventSchema.pre<EventDocument>('save', function preSave(next) {
  try {
    // Ensure required string fields are non-empty after trimming.
    const stringFields: (keyof EventAttrs)[] = [
      'title',
      'description',
      'overview',
      'image',
      'venue',
      'location',
      'date',
      'time',
      'mode',
      'audience',
      'organizer',
    ];

    for (const field of stringFields) {
      const value = this.get(field);
      if (typeof value !== 'string' || value.trim().length === 0) {
        this.invalidate(field as string, `${field} is required and cannot be empty.`);
      }
    }

    // Normalize date and time formats.
    if (this.isModified('date')) {
      this.date = normalizeDate(this.date);
    }

    if (this.isModified('time')) {
      this.time = normalizeTime(this.time);
    }

    // Generate or update slug only when title changes.
    if (this.isNew || this.isModified('title')) {
      this.slug = slugify(this.title);
    }

    next();
  } catch (err) {
    next(err as Error);
  }
});

export const Event: EventModel = (models.Event as EventModel) || model<EventDocument, EventModel>('Event', EventSchema);
