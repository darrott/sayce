const express = require('express');
const app = express();
const cors = require('cors');

const mysql = require('mysql');
const connection = mysql.createConnection({
	host: '129.152.28.235',
	user: 'sayce',
	password: 'appOrderSayce',
	database: 'sayce'
});

app.use(cors());

app.get('/', (req, res) => {
	connection.connect();
	connection.query("INSERT INTO TAVOLO (uuid, username) VALUE (123456789, 'Andrea')");
	connection.end();
	res.send('Attivo');
});

app.listen(3000);
