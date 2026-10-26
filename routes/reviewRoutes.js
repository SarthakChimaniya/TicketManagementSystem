const express = require('express');
const router = express.Router();
const {
  getReviews,
  createReview,
  moderateReview
} = require('../controllers/reviewController');

router.route('/')
  .get(getReviews)
  .post(createReview);

router.route('/:id/moderate')
  .put(moderateReview);

module.exports = router;
