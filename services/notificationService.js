/**
 * Mock Notification Service (Email & SMS)
 * Dispatches digital e-tickets upon confirmed ticket bookings.
 */

class NotificationService {
  /**
   * Dispatch e-ticket via simulated Email and SMS
   */
  async sendETicketNotification({ booking, movie, theatre, show, userEmail }) {
    const movieTitle = movie ? movie.movieName : (show ? show.movieId : 'Movie');
    const theatreTitle = theatre ? theatre.theatreName : (show ? show.theatreName : 'iMovies Screen');
    const location = theatre ? theatre.location : 'Main Auditorium';
    const showDateFormatted = show && show.showdate ? new Date(show.showdate).toLocaleDateString() : 'N/A';
    const showTimeFormatted = show ? show.showtime : 'N/A';
    const seatList = Array.isArray(booking.ticketsData) ? booking.ticketsData.join(', ') : JSON.stringify(booking.ticketsData);

    const eTicket = {
      bookingId: booking.bookingId,
      movieName: movieTitle,
      theatreName: theatreTitle,
      location: location,
      showDate: showDateFormatted,
      showTime: showTimeFormatted,
      seats: booking.ticketsData,
      seatSummary: seatList,
      totalAmount: booking.totalAmount,
      currency: 'INR',
      status: 'CONFIRMED',
      qrCodeToken: `IMOVIE-TKT-${booking.bookingId}-${Date.now().toString(36).toUpperCase()}`,
      issuedAt: new Date().toISOString(),
      recipientEmail: userEmail || booking.userEmail
    };

    // Simulated Email Dispatch
    console.log('\n======================================================');
    console.log('📧 [MOCK EMAIL DISPATCHED] iMovies E-Ticket Confirmation');
    console.log(`To: ${eTicket.recipientEmail}`);
    console.log(`Subject: Your iMovies E-Ticket for ${movieTitle}! (Booking ID: ${booking.bookingId})`);
    console.log('------------------------------------------------------');
    console.log(`🎬 Movie:    ${eTicket.movieName}`);
    console.log(`🏢 Theatre:  ${eTicket.theatreName} (${eTicket.location})`);
    console.log(`📅 Date:     ${eTicket.showDate} at ${eTicket.showTime}`);
    console.log(`🎟️  Seats:    ${eTicket.seatSummary}`);
    console.log(`💳 Paid:     ₹${eTicket.totalAmount} (Confirmed)`);
    console.log(`📱 QR Token: ${eTicket.qrCodeToken}`);
    console.log('======================================================\n');

    // Simulated SMS Dispatch
    console.log('📱 [MOCK SMS DISPATCHED]');
    console.log(`To: ${eTicket.recipientEmail}`);
    console.log(`Message: iMovies: Confirmed! ${eTicket.movieName} at ${eTicket.theatreName}, ${eTicket.showDate} ${eTicket.showTime}. Seats: ${eTicket.seatSummary}. Booking ID: ${eTicket.bookingId}. Enjoy your show!`);
    console.log('------------------------------------------------------\n');

    return {
      success: true,
      emailDispatched: true,
      smsDispatched: true,
      recipient: eTicket.recipientEmail,
      dispatchedAt: eTicket.issuedAt,
      eTicket
    };
  }
}

module.exports = new NotificationService();
