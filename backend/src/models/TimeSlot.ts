import mongoose, { Schema, Document } from 'mongoose';

/**
 * Time Slot interface
 */
export interface ITimeSlot extends Document {
  date: Date;
  time: string; // "18:00", "18:30", etc.
  capacity: number;
  booked: number;
  isBlocked: boolean;
  blockedBy?: string; // Admin ID who blocked it
  blockedReason?: string;
  bookingIds: string[];
  createdAt: Date;
  updatedAt: Date;
  hasAvailability(guestCount: number): boolean;
  bookSeats(guestCount: number, bookingId: string): boolean;
  releaseSeats(guestCount: number, bookingId: string): void;
}

/**
 * MongoDB Schema for Time Slots
 */
const TimeSlotSchema: Schema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true
    },
    time: {
      type: String,
      required: true,
      index: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    capacity: {
      type: Number,
      required: true,
      default: 50, // Restaurant can handle 50 guests per slot
      min: 0
    },
    booked: {
      type: Number,
      default: 0,
      min: 0
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true
    },
    blockedBy: {
      type: String
    },
    blockedReason: {
      type: String
    },
    bookingIds: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

/**
 * Compound index for efficient date + time queries
 */
TimeSlotSchema.index({ date: 1, time: 1 }, { unique: true });

/**
 * Method to check if slot has availability
 */
TimeSlotSchema.methods.hasAvailability = function (guestCount: number): boolean {
  if (this.isBlocked) return false;
  return this.capacity - this.booked >= guestCount;
};

/**
 * Method to book seats
 */
TimeSlotSchema.methods.bookSeats = function (guestCount: number, bookingId: string): boolean {
  if (!this.hasAvailability(guestCount)) return false;

  this.booked += guestCount;
  this.bookingIds.push(bookingId);
  return true;
};

/**
 * Method to release seats (for cancellations)
 */
TimeSlotSchema.methods.releaseSeats = function (guestCount: number, bookingId: string): void {
  this.booked = Math.max(0, this.booked - guestCount);
  this.bookingIds = this.bookingIds.filter((id: string) => id !== bookingId);
};

export default mongoose.model<ITimeSlot>('TimeSlot', TimeSlotSchema);
