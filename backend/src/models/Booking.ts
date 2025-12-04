import mongoose, { Schema, Document } from 'mongoose';

/**
 * Booking interface for TypeScript
 */
export interface IBooking extends Document {
  bookingId: string;
  customerName: string;
  numberOfGuests: number;
  bookingDate: Date;
  bookingTime: string;
  cuisinePreference: string;
  specialRequests?: string;
  weatherInfo?: {
    condition: string;
    temperature: number;
    description: string;
  };
  seatingPreference: 'indoor' | 'outdoor';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  sessionId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * MongoDB Schema for Restaurant Bookings
 */
const BookingSchema: Schema = new Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  bookingDate: {
    type: Date,
    required: true
  },
  bookingTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  cuisinePreference: {
    type: String,
    required: true,
    trim: true
  },
  specialRequests: {
    type: String,
    trim: true,
    default: ''
  },
  weatherInfo: {
    condition: String,
    temperature: Number,
    description: String
  },
  seatingPreference: {
    type: String,
    enum: ['indoor', 'outdoor'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  sessionId: {
    type: String,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
BookingSchema.index({ bookingDate: 1, bookingTime: 1 });
BookingSchema.index({ customerName: 1 });
BookingSchema.index({ status: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
