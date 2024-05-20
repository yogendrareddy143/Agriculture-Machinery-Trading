const express = require('express');
const tradeController = require('../controllers/tradeController');
const mainController = require('../controllers/mainController');
const router = express.Router();
const { isLoggedIn, isAuthor,isNotAuthor,canCancel,canAccept } = require('../middlewares/auth');
const {validateId,validateTrade,validateResult} = require('../middlewares/validator');
//Get /stories: send all stories to the user 

router.get('/', mainController.index);

//Get /stories/new: send html form for creating a new story

router.get('/machineries',tradeController.machineries);

//post /stories: create a new story

router.post('/',isLoggedIn,tradeController.create);
router.get('/machinery/:id',validateId,tradeController.machinery);
router.get('/newMachinery',isLoggedIn,mainController.newMachinery);

//GET /stories/:id/edit: send html form for editing an existing story
router.get('/:id/edit',validateId,isLoggedIn,isAuthor, tradeController.edit);

//PUT /stories: id: update details of story identified by id
router.put('/:id',validateId,isLoggedIn,isAuthor,tradeController.update);

//DELETE /stories: id: delete details of story identified by id
router.delete('/:id',validateId,isLoggedIn,isAuthor,tradeController.delete);

router.put("/trade/watch/:id",validateId,isLoggedIn,isNotAuthor,validateResult,tradeController.watchFeature);

router.put("/trade/unwatch/:id",validateId,isLoggedIn,isNotAuthor,validateResult,tradeController.unwatchFeature);

router.get("/trade/offer/:id",validateId,isLoggedIn,isNotAuthor,validateResult,tradeController.getAvailability);

router.post("/trade/offer/:id",validateId,isLoggedIn,isNotAuthor,validateResult,tradeController.makeTradeOffer);

router.post("/trade/offer/reject/:storyItemId/:itemId",isLoggedIn,canCancel,validateResult,tradeController.rejectTradeOffer);

router.get("/trade/offer/manage/:id",validateId,validateResult,tradeController.manageOffer);

router.post("/trade/offer/:tradeItemId/:itemId/accept",isLoggedIn,canAccept,validateResult,tradeController.acceptTradeOffer);
module.exports = router;