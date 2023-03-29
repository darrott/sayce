const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
require('dotenv').config();

app.use(
	cors({
		origin: '*'
	})
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const server = http.createServer(app);
const socketIO = require('socket.io');
const io = socketIO(server, {
	path: '/api/socket.io',
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
});
const nsp = io.of('/api/frontend');

const mysql = require('mysql');
const connection = mysql.createPool({
	connectionLimit: 50,
	host: process.env.DBHOST,
	port: process.env.DBPORT,
	user: process.env.DBUSER,
	password: process.env.DBPASS,
	database: process.env.DBNAME
});

io.on('connection', (socket) => {
	console.log(`Benvenuto ${socket.id}`);

	const { roomId } = socket.handshake.query;

	socket.join(roomId);

	socket.on('leave-room', (roomId) => {
		socket.leave(roomId);
		console.log(`${socket.id} lascia la room ${roomId}`);
	});
});

app.get('/api', async (req, res) => {
	res.send('Attivo');
});

app.post('/api/table/create', async (req, res) => {
	try {
		connection.query('INSERT INTO tavoli (uuid) VALUE (UUID())', (error, results, fields) => {
			if (error) {
				res.send(error);
				throw error;
			}
			connection.query(
				`SELECT uuid FROM tavoli WHERE id = ${results.insertId}`,
				(error, results, fields) => {
					if (error) {
						res.send(error);
						throw error;
					}
					res.send(results[0]);
				}
			);
		});
	} catch (error) {
		res.send(error);
	}
});

app.post('/api/table/user/insert', (req, res) => {
	let tableId = req.body.tableId;
	let username = req.body.username.username;
	let uuid = req.body.username.uuid;
	try {
		let query =
			uuid != '' && uuid != 'undefined'
				? `INSERT INTO tavolo (tavolo, username, userUUID) VALUES ('${tableId}', '${username}', '${uuid}')`
				: `INSERT INTO tavolo (tavolo, username, userUUID) VALUES ('${tableId}', '${username}', UUID())`;
		connection.query(query, (error, results, fields) => {
			if (error) {
				res.send({ state: 'Could not insert USER into DB', data: error });
				throw error;
			}
			io.to(tableId).emit('nuovo-partecipante', {
				table: tableId,
				action: 'update-partecipanti'
			});
			connection.query(
				`SELECT userUUID FROM tavolo WHERE id = ${results.insertId}`,
				(error, results, fields) => {
					if (error) {
						res.send({ state: 'Could not retrieve USER UUID', data: error });
					}
					res.send({ state: 'success', data: results[0] });
				}
			);
		});
	} catch (error) {
		res.send(error);
	}
});

app.post('/api/table/user/updateCart', (req, res) => {
	let piatti = JSON.stringify(req.body.piatti);
	let tableId = req.body.tableId;
	let userUUID = req.body.userUUID;
	try {
		connection.query(
			`UPDATE tavolo SET ordinazione = '${piatti}' WHERE userUUID = '${userUUID}' AND tavolo = '${tableId}'`,
			(error, results, fields) => {
				if (error) {
					res.send({ state: 'Could not update ordinazione', data: error });
					throw error;
				}
				res.send({ state: 'success' });
			}
		);
	} catch (error) {
		res.send({ state: 'Erorr' });
	}
});

app.post('/api/table/user/getCart', (req, res) => {
	let tableId = req.body.tableId;
	let userUUID = req.body.userUUID;
	try {
		connection.query(
			`SELECT ordinazione FROM tavolo WHERE userUUID = '${userUUID}' AND tavolo = '${tableId}'`,
			(error, results, fields) => {
				if (error) {
					res.send({ state: 'Could not get ordinazione', data: error });
					throw error;
				}
				res.send({ state: 'success', data: results });
			}
		);
	} catch (error) {
		res.send({ state: 'Error' });
	}
});

app.post('/api/table/getTotal', (req, res) => {
	let tableId = req.body.tableId;
	try {
		connection.query(
			`SELECT ordinazione FROM tavolo WHERE tavolo = '${tableId}' AND ordinazione != ''`,
			(error, results, fields) => {
				if (error) {
					res.send({ state: 'Could not get all ordinazioni', data: error });
					throw error;
				}
				res.send({ state: 'success', data: results });
			}
		);
	} catch (error) {
		res.send({ state: 'Error' });
	}
});

app.post('/api/table/seated', (req, res) => {
	let tableId = req.body.tableId;
	try {
		connection.query(
			`SELECT username FROM tavolo WHERE tavolo = '${tableId}'`,
			(error, results, fields) => {
				if (error) {
					res.send({ state: 'Could not retrieve users at table', data: error });
					throw error;
				}
				res.send({ state: 'sucess', data: results });
			}
		);
	} catch (error) {
		res.send({ state: 'Error' });
	}
});

server.listen(process.env.PORT);
