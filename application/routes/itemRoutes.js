// routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

router.put('/:id/toggle-sold', itemController.toggleItemSoldStatus);
router.delete('/:id', itemController.deleteItemById);
router.get('/user/:userID', itemController.getItemsByUser);
router.get('/random/:count', itemController.getRandomItems);
router.get('/recent/:count', itemController.getRecentItems);
router.get('/oldest/:count', itemController.getOldestItems);
router.get('/similar', itemController.getSimilarItems);
router.get('/search', itemController.searchListings);
router.get('/:id', itemController.getItemById);



module.exports = router;