import TimeSlot, { ITimeSlot } from '../models/TimeSlot';

/**
 * Time Slot Service
 * Manages booking availability and conflicts
 */
class TimeSlotService {
  // Restaurant operating hours
  private readonly OPENING_TIME = '11:00';
  private readonly CLOSING_TIME = '22:00';
  private readonly SLOT_INTERVAL = 30; // minutes
  private readonly DEFAULT_CAPACITY = 50; // guests per slot

  /**
   * Parse time string to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes to time string
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Generate all time slots for a day
   */
  private generateDaySlots(): string[] {
    const slots: string[] = [];
    const start = this.timeToMinutes(this.OPENING_TIME);
    const end = this.timeToMinutes(this.CLOSING_TIME);

    for (let minutes = start; minutes <= end; minutes += this.SLOT_INTERVAL) {
      slots.push(this.minutesToTime(minutes));
    }

    return slots;
  }

  /**
   * Get or create time slot
   */
  async getOrCreateSlot(date: Date, time: string): Promise<ITimeSlot> {
    try {
      // Normalize date to start of day
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      let slot = await TimeSlot.findOne({ date: normalizedDate, time });

      if (!slot) {
        slot = new TimeSlot({
          date: normalizedDate,
          time,
          capacity: this.DEFAULT_CAPACITY,
          booked: 0,
          isBlocked: false,
          bookingIds: []
        });
        await slot.save();
      }

      return slot;
    } catch (error) {
      console.error('[TimeSlot] Error getting/creating slot:', error);
      throw error;
    }
  }

  /**
   * Check if slot has availability
   */
  async checkAvailability(date: Date, time: string, guestCount: number): Promise<boolean> {
    try {
      const slot = await this.getOrCreateSlot(date, time);
      return slot.hasAvailability(guestCount);
    } catch (error) {
      console.error('[TimeSlot] Error checking availability:', error);
      return false;
    }
  }

  /**
   * Book a time slot
   */
  async bookSlot(
    date: Date,
    time: string,
    guestCount: number,
    bookingId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const slot = await this.getOrCreateSlot(date, time);

      if (!slot.hasAvailability(guestCount)) {
        return {
          success: false,
          message: 'Time slot is fully booked or blocked.'
        };
      }

      const booked = slot.bookSeats(guestCount, bookingId);

      if (!booked) {
        return {
          success: false,
          message: 'Failed to book slot. Not enough capacity.'
        };
      }

      await slot.save();

      return {
        success: true,
        message: 'Slot booked successfully.'
      };
    } catch (error) {
      console.error('[TimeSlot] Error booking slot:', error);
      return {
        success: false,
        message: 'Failed to book slot due to server error.'
      };
    }
  }

  /**
   * Cancel a booking and release seats
   */
  async releaseSlot(date: Date, time: string, guestCount: number, bookingId: string): Promise<void> {
    try {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const slot = await TimeSlot.findOne({ date: normalizedDate, time });

      if (slot) {
        slot.releaseSeats(guestCount, bookingId);
        await slot.save();
        console.log(`[TimeSlot] Released ${guestCount} seats for ${bookingId}`);
      }
    } catch (error) {
      console.error('[TimeSlot] Error releasing slot:', error);
    }
  }

  /**
   * Find nearest available slots
   */
  async findNearestAvailableSlots(
    date: Date,
    preferredTime: string,
    guestCount: number,
    maxResults: number = 3
  ): Promise<string[]> {
    try {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const allSlots = this.generateDaySlots();
      const preferredMinutes = this.timeToMinutes(preferredTime);

      // Sort slots by proximity to preferred time
      const sortedSlots = allSlots.sort((a, b) => {
        const diffA = Math.abs(this.timeToMinutes(a) - preferredMinutes);
        const diffB = Math.abs(this.timeToMinutes(b) - preferredMinutes);
        return diffA - diffB;
      });

      const availableSlots: string[] = [];

      for (const time of sortedSlots) {
        if (availableSlots.length >= maxResults) break;

        const isAvailable = await this.checkAvailability(normalizedDate, time, guestCount);

        if (isAvailable) {
          availableSlots.push(time);
        }
      }

      return availableSlots;
    } catch (error) {
      console.error('[TimeSlot] Error finding nearest slots:', error);
      return [];
    }
  }

  /**
   * Get all slots for a specific date
   */
  async getSlotsForDate(date: Date): Promise<ITimeSlot[]> {
    try {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      return await TimeSlot.find({ date: normalizedDate }).sort({ time: 1 });
    } catch (error) {
      console.error('[TimeSlot] Error getting slots for date:', error);
      return [];
    }
  }

  /**
   * Block a time slot (admin function)
   */
  async blockSlot(date: Date, time: string, adminId: string, reason?: string): Promise<boolean> {
    try {
      const slot = await this.getOrCreateSlot(date, time);

      slot.isBlocked = true;
      slot.blockedBy = adminId;
      slot.blockedReason = reason || 'Blocked by admin';

      await slot.save();
      console.log(`[TimeSlot] Blocked slot ${date} ${time} by admin ${adminId}`);
      return true;
    } catch (error) {
      console.error('[TimeSlot] Error blocking slot:', error);
      return false;
    }
  }

  /**
   * Unblock a time slot (admin function)
   */
  async unblockSlot(date: Date, time: string): Promise<boolean> {
    try {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const slot = await TimeSlot.findOne({ date: normalizedDate, time });

      if (!slot) {
        return false;
      }

      slot.isBlocked = false;
      slot.blockedBy = undefined;
      slot.blockedReason = undefined;

      await slot.save();
      console.log(`[TimeSlot] Unblocked slot ${date} ${time}`);
      return true;
    } catch (error) {
      console.error('[TimeSlot] Error unblocking slot:', error);
      return false;
    }
  }

  /**
   * Get availability summary for a date
   */
  async getAvailabilitySummary(date: Date): Promise<{
    totalSlots: number;
    availableSlots: number;
    bookedSlots: number;
    blockedSlots: number;
    capacityUtilization: number;
  }> {
    try {
      const slots = await this.getSlotsForDate(date);
      const allSlotTimes = this.generateDaySlots();

      const totalSlots = allSlotTimes.length;
      let availableSlots = 0;
      let bookedSlots = 0;
      let blockedSlots = 0;
      let totalCapacity = 0;
      let totalBooked = 0;

      for (const time of allSlotTimes) {
        const slot = slots.find(s => s.time === time);

        if (!slot) {
          availableSlots++;
          totalCapacity += this.DEFAULT_CAPACITY;
        } else {
          totalCapacity += slot.capacity;
          totalBooked += slot.booked;

          if (slot.isBlocked) {
            blockedSlots++;
          } else if (slot.booked >= slot.capacity) {
            bookedSlots++;
          } else {
            availableSlots++;
          }
        }
      }

      const capacityUtilization = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;

      return {
        totalSlots,
        availableSlots,
        bookedSlots,
        blockedSlots,
        capacityUtilization: Math.round(capacityUtilization * 100) / 100
      };
    } catch (error) {
      console.error('[TimeSlot] Error getting availability summary:', error);
      return {
        totalSlots: 0,
        availableSlots: 0,
        bookedSlots: 0,
        blockedSlots: 0,
        capacityUtilization: 0
      };
    }
  }
}

export default new TimeSlotService();
