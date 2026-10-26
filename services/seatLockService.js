/**
 * Real-Time Seat Lock Service
 * Manages in-memory seat locks with Time-To-Live (TTL) expiration and WebSocket broadcast.
 */

class SeatLockService {
  constructor() {
    // Structure: { [showId]: { [seatNumber]: { userEmail, lockedAt, expiresAt, timer } } }
    this.locks = new Map();
    this.defaultTTL = parseInt(process.env.SEAT_LOCK_TTL_SECONDS || '600', 10); // default 10 minutes (600s)
  }

  /**
   * Get all active locks for a specific show
   */
  getShowLocks(showId) {
    if (!this.locks.has(showId)) {
      this.locks.set(showId, new Map());
    }
    return this.locks.get(showId);
  }

  /**
   * Retrieve list of currently locked seat numbers for a show
   */
  getLockedSeats(showId) {
    const showLocks = this.getShowLocks(showId);
    const now = Date.now();
    const result = [];

    for (const [seatNumber, lockData] of showLocks.entries()) {
      if (lockData.expiresAt > now) {
        result.push({
          seatNumber,
          userEmail: lockData.userEmail,
          expiresAt: lockData.expiresAt,
          remainingSeconds: Math.max(0, Math.round((lockData.expiresAt - now) / 1000))
        });
      } else {
        // Purge expired
        clearTimeout(lockData.timer);
        showLocks.delete(seatNumber);
      }
    }

    return result;
  }

  /**
   * Check if a specific seat is locked and unexpired
   */
  isSeatLocked(showId, seatNumber) {
    const showLocks = this.getShowLocks(showId);
    const lock = showLocks.get(seatNumber);
    if (!lock) return false;

    if (Date.now() > lock.expiresAt) {
      clearTimeout(lock.timer);
      showLocks.delete(seatNumber);
      return false;
    }

    return true;
  }

  /**
   * Check if all specified seats are locked by a particular user
   */
  verifyUserOwnsLocks(showId, seats, userEmail) {
    const showLocks = this.getShowLocks(showId);
    const now = Date.now();

    for (const seat of seats) {
      const lock = showLocks.get(seat);
      if (!lock || lock.expiresAt <= now || lock.userEmail !== userEmail) {
        return false;
      }
    }
    return true;
  }

  /**
   * Temporarily lock seats with TTL expiration
   */
  lockSeats({ showId, seats, userEmail, ttlSeconds, io }) {
    const ttl = (ttlSeconds || this.defaultTTL) * 1000;
    const expiresAt = Date.now() + ttl;
    const showLocks = this.getShowLocks(showId);
    const conflicts = [];

    // Check if any seat is already locked by someone else
    for (const seat of seats) {
      const existingLock = showLocks.get(seat);
      if (existingLock && existingLock.expiresAt > Date.now() && existingLock.userEmail !== userEmail) {
        conflicts.push(seat);
      }
    }

    if (conflicts.length > 0) {
      return {
        success: false,
        error: `Seats [${conflicts.join(', ')}] are currently reserved by another customer.`,
        conflicts
      };
    }

    // Apply lock with automatic TTL release
    for (const seat of seats) {
      const existing = showLocks.get(seat);
      if (existing && existing.timer) {
        clearTimeout(existing.timer);
      }

      const timer = setTimeout(() => {
        this.handleAutoExpire(showId, [seat], io);
      }, ttl);

      showLocks.set(seat, {
        userEmail,
        lockedAt: Date.now(),
        expiresAt,
        timer
      });
    }

    // Broadcast WebSocket event to all clients viewing this show
    if (io) {
      io.to(`show_${showId}`).emit('seats-locked', {
        showId,
        seats,
        lockedBy: userEmail,
        expiresAt,
        ttlSeconds: Math.round(ttl / 1000)
      });
    }

    return {
      success: true,
      showId,
      lockedSeats: seats,
      expiresAt,
      ttlSeconds: Math.round(ttl / 1000)
    };
  }

  /**
   * Release locked seats back to available pool
   */
  releaseSeats({ showId, seats, userEmail, io, reason = 'user_released' }) {
    const showLocks = this.getShowLocks(showId);
    const released = [];

    for (const seat of seats) {
      const lock = showLocks.get(seat);
      if (lock) {
        // If userEmail is provided, only allow the owner or admin/system to release
        if (!userEmail || lock.userEmail === userEmail) {
          clearTimeout(lock.timer);
          showLocks.delete(seat);
          released.push(seat);
        }
      }
    }

    if (released.length > 0 && io) {
      io.to(`show_${showId}`).emit('seats-released', {
        showId,
        seats: released,
        reason
      });
    }

    return {
      success: true,
      showId,
      releasedSeats: released,
      reason
    };
  }

  /**
   * Internal handler for TTL expiration
   */
  handleAutoExpire(showId, seats, io) {
    const showLocks = this.getShowLocks(showId);
    const expired = [];

    for (const seat of seats) {
      if (showLocks.has(seat)) {
        showLocks.delete(seat);
        expired.push(seat);
      }
    }

    if (expired.length > 0 && io) {
      console.log(`[SeatLockService] TTL expired for seats [${expired.join(', ')}] in show ${showId}`);
      io.to(`show_${showId}`).emit('seats-released', {
        showId,
        seats: expired,
        reason: 'ttl_expired'
      });
    }
  }

  /**
   * Permanently clear locks upon successful checkout
   */
  finalizeBookedSeats({ showId, seats, io }) {
    const showLocks = this.getShowLocks(showId);
    for (const seat of seats) {
      const lock = showLocks.get(seat);
      if (lock && lock.timer) {
        clearTimeout(lock.timer);
      }
      showLocks.delete(seat);
    }

    if (io) {
      io.to(`show_${showId}`).emit('seats-booked', {
        showId,
        seats
      });
    }
  }
}

// Export singleton instance
module.exports = new SeatLockService();
