const express = require('express');
const router = express.Router();
const {
	User,
	validate,
	validateCards
} = require('../models/user');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {
	Card
} = require('../models/card');
const auth = require('./../middleware/auth')

router.get('/dashboard', auth, async (req, res) => {
	const user = await User.findById(req.user._id).select('-password');
	res.send(user);
})

const getCards = async (cardsArray) => {
	const cards = await Card.find({
		"bizNumber": {
			$in: cardsArray
		}
	});
	return cards;
};

router.get('/cards', auth, async (req, res) => {
	if (!req.query.numbers) return res.status(400).send("Missing numbers");

	const cards = await getCards(req.query.numbers.split(","));
	res.send(cards)
});

router.patch('/cards', auth, async (req, res) => {

	const {
		error
	} = validateCards(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const cards = await getCards(req.body.cards);
	if (cards.length != req.body.cards.length) res.status(400).send("Card numbers don't match");

	let user = await User.findById(req.user._id);
	user.cards = req.body.cards;
	user = await user.save();
	res.send(user);

});

router.post('/registration', async (req, res) => {
	const {
		error
	} = await validate(req.body)
	if (error) {
		return res.status(400).send(error.details[0].message);
	}
	let user = await User.findOne({
		email: req.body.email
	});
	if (user)
		return res.status(400).send('User already registered.');

	const userToSave = new User(req.body)
	const hashedPassword = await bcrypt.hash(userToSave.password, 10)
	userToSave.password = hashedPassword

	userToSave.save().then(() => {
		return res.status(200).send(
			_.pick(userToSave, ['_id', 'name', 'email']))
	}).catch((err) => {
		return res.status(400).send(err)
	})
});

module.exports = router;