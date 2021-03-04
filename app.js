const users = require('./routes/users');
const cards = require('./routes/cards');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const mongoose = require('mongoose');
const auth = require('./routes/auth');


mongoose.connect(process.env.DB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false
	}).then(() => {
		console.log('Connected to MongoDB...\n' + "database used: " + mongoose.connections[0].name)
	}).catch(err => console.error('Could not connect to MongoDB...', err));

app.use(express.json());

app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/cards/', cards);

const port = 3000;
http.listen(port, () => console.log(`Listening on port ${port}...`));