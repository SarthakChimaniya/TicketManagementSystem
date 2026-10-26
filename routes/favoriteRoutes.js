const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite
} = require('../controllers/favoriteController');

router.route('/')
  .get(getFavorites)
  .post(addFavorite)
  .delete(removeFavorite);

module.exports = router;
