const { io: Client } = require('socket.io-client');
const { app, server, io } = require('../server');
const seatLockService = require('../services/seatLockService');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');
const showController = require('../controllers/showController');
const bookingController = require('../controllers/bookingController');

console.log('--- Starting Prompt 3 Business Logic & Real-Time Tests ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`PASS: ${message}`);
    passed++;
  } else {
    console.error(`FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  // Start server on an ephemeral port
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // ----------------------------------------------------
    // 1. Test SeatLockService Unit & TTL Logic
    // ----------------------------------------------------
    const showId = 'TEST_SHOW_101';
    const user1 = 'alice@example.com';
    const user2 = 'bob@example.com';

    // Lock seats B1, B2 for Alice
    const lock1 = seatLockService.lockSeats({
      showId,
      seats: ['B1', 'B2'],
      userEmail: user1,
      ttlSeconds: 60,
      io
    });
    assert(lock1.success === true && lock1.lockedSeats.length === 2, 'SeatLockService successfully locks seats for user 1');
    assert(seatLockService.isSeatLocked(showId, 'B1'), 'isSeatLocked returns true for locked seat B1');

    // User 2 attempts to lock seat B1 (conflict)
    const lockConflict = seatLockService.lockSeats({
      showId,
      seats: ['B1', 'B3'],
      userEmail: user2,
      ttlSeconds: 60,
      io
    });
    assert(lockConflict.success === false && lockConflict.conflicts.includes('B1'), 'SeatLockService detects conflicting seat reservation for user 2');

    // Retrieve locked seats
    const currentLocks = seatLockService.getLockedSeats(showId);
    assert(currentLocks.length === 2, 'getLockedSeats returns active locks count');

    // Release seat B2 manually
    const releaseResult = seatLockService.releaseSeats({
      showId,
      seats: ['B2'],
      userEmail: user1,
      io
    });
    assert(releaseResult.success && releaseResult.releasedSeats.includes('B2'), 'SeatLockService releases seat B2');
    assert(!seatLockService.isSeatLocked(showId, 'B2'), 'Seat B2 is now unlocked and available');

    // Test Short TTL Expiration (1 second TTL)
    seatLockService.lockSeats({
      showId,
      seats: ['L5'],
      userEmail: user1,
      ttlSeconds: 1,
      io
    });
    assert(seatLockService.isSeatLocked(showId, 'L5'), 'Seat L5 locked with 1s TTL');
    await new Promise((r) => setTimeout(r, 1100));
    assert(!seatLockService.isSeatLocked(showId, 'L5'), 'Seat L5 auto-released after TTL expiration');

    // ----------------------------------------------------
    // 2. Test Payment Gateway Service
    // ----------------------------------------------------
    const paymentIntent = await paymentService.createPaymentIntent({
      amount: 500,
      currency: 'inr',
      metadata: { showId, userEmail: user1 }
    });
    assert(paymentIntent.success && paymentIntent.paymentIntentId && paymentIntent.amount === 500, 'PaymentService creates payment intent');

    // Test successful transaction
    const successfulTxn = await paymentService.processTransaction({
      paymentIntentId: paymentIntent.paymentIntentId,
      paymentMethod: 'card'
    });
    assert(successfulTxn.success && successfulTxn.status === 'succeeded', 'PaymentService processes successful payment');

    // Test failed transaction
    const failedTxn = await paymentService.processTransaction({
      paymentIntentId: paymentIntent.paymentIntentId,
      forceFail: true
    });
    assert(failedTxn.success === false && failedTxn.status === 'failed', 'PaymentService properly handles declined/failed payment');

    // ----------------------------------------------------
    // 3. Test Mock Notification Service
    // ----------------------------------------------------
    const notifResult = await notificationService.sendETicketNotification({
      booking: {
        bookingId: 'BKG-TEST-12345',
        ticketsData: ['B1', 'B2'],
        totalAmount: 800,
        userEmail: user1
      },
      movie: { movieName: 'Interstellar' },
      theatre: { theatreName: 'PVR IMAX', location: 'Downtown' },
      show: { showdate: new Date(), showtime: '07:30 PM' },
      userEmail: user1
    });
    assert(notifResult.success && notifResult.emailDispatched && notifResult.smsDispatched, 'NotificationService dispatches email & SMS e-ticket');
    assert(notifResult.eTicket.qrCodeToken.startsWith('IMOVIE-TKT-'), 'NotificationService generated valid e-ticket QR token');

    // ----------------------------------------------------
    // 4. Test Controller Method Signatures & Integrations
    // ----------------------------------------------------
    assert(typeof showController.getFilteredShowsAndMovies === 'function', 'showController.getFilteredShowsAndMovies is defined');
    assert(typeof showController.getSeatLayoutAndAvailability === 'function', 'showController.getSeatLayoutAndAvailability is defined');
    assert(typeof bookingController.lockSeats === 'function', 'bookingController.lockSeats is defined');
    assert(typeof bookingController.releaseSeats === 'function', 'bookingController.releaseSeats is defined');
    assert(typeof bookingController.createCheckoutSession === 'function', 'bookingController.createCheckoutSession is defined');
    assert(typeof bookingController.processPaymentAndConfirm === 'function', 'bookingController.processPaymentAndConfirm is defined');

    // ----------------------------------------------------
    // 5. Test WebSockets Real-Time Seat Events (Socket.io)
    // ----------------------------------------------------
    const clientSocket = Client(baseUrl);

    await new Promise((resolve) => {
      clientSocket.on('connect', () => {
        assert(clientSocket.connected, 'Socket.io client successfully connected to server');
        resolve();
      });
    });

    // Test join-show and initial-locked-seats
    await new Promise((resolve) => {
      clientSocket.emit('join-show', showId);
      clientSocket.on('initial-locked-seats', (data) => {
        assert(data.showId === showId, 'Socket.io client received initial-locked-seats event for room');
        resolve();
      });
    });

    // Test socket locking event emission and broadcast
    await new Promise((resolve) => {
      clientSocket.emit('lock-seats', {
        showId,
        seats: ['M10', 'M11'],
        userEmail: 'socket_user@example.com',
        ttlSeconds: 30
      });

      clientSocket.on('lock-result', (res) => {
        assert(res.success && res.lockedSeats.includes('M10'), 'Socket.io client successfully locked seats via socket event');
        resolve();
      });
    });

    // Disconnect socket client
    clientSocket.disconnect();

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log(`\nPrompt 3 Results: ${passed} passed, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
