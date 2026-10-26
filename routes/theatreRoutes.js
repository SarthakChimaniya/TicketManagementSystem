const express = require('express');
const router = express.Router();
const {
  getAllTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre
} = require('../controllers/theatreController');

router.route('/')
  .get(getAllTheatres)
  .post(createTheatre);

router.route('/:theatreId')
  .get(getTheatreById)
  .put(updateTheatre)
  .delete(deleteTheatre);

module.exports = router;
