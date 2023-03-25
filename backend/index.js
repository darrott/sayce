const express = require('express');
const app = express();
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const mysql = require('mysql');
const connection = mysql.createPool({
	connectionLimit: 50,
	host: 'localhost',
	port: '3306',
	user: 'sayce',
	password: 'appOrderSayce',
	database: 'sayce'
});

app.use(cors());

app.get('/', async (req, res) => {
	try {
		let uuid = await uuidv4();
		connection.query(`INSERT INTO tavoli (uuid) VALUE ('${uuid}')`, (error, results, fields) => {
			if (error) throw error;
			return results;
		});
		console.log('Fatto');
	} catch (error) {
		console.error(error);
	}
	res.send('Attivo');
});

app.post('/table/create', async (req, res) => {
	try {
		let stopped = false;
		let uuid;
		const queryDone = () =>
			new Promise((res, rej) => {
				connection.query(
					`INSERT INTO tavoli (uuid) VALUE ('${uuid}')`,
					(error, results, fields) => {
						if (error) {
							res(error);
							throw error;
						} else {
							stopped = true;
							res(results);
						}
					}
				);
			});
		while (!stopped) {
			uuid = uuidv4();
			console.log(uuid);
			await queryDone(stopped, uuid);
		}
		res.send(JSON.stringify({ uuid: uuid }));
	} catch (error) {
		res.send(error);
	}
});

app.post('/table/user/insert', async (req, res) => {
	console.log(req.query);
	try {
		connection.query(
			`INSERT INTO tavolo (tavolo, username) VALUES ('${req.query.tableId}', '${req.query.username}')`,
			(error, results, fields) => {
				if (error) {
					res.send({ state: 'error', data: results });
					throw error;
				}
				res.send({ state: 'success', data: results });
			}
		);
	} catch (error) {
		res.send(error);
	}
});

app.listen(3000);
