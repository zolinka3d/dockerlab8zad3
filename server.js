const express = require('express');
const Redis = require('ioredis');
const { Client } = require('pg');

const app = express();
app.use(express.json());

const clientPG = new Client({
  host: 'postgres',
  port: 5432,
  database: 'mydatabase',
  user: 'postgres',
  password: 'password',
});
clientPG.connect();

clientPG.query(
  'CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50) NOT NULL);'
);

const client = new Redis({
  host: 'redis',
  port: 6379,
});
client.on('error', (err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/message', async (req, res) => {
  const message = req.body.message;
  await client.rpush('messages', message);
  res.send('Message sent');
});

app.get('/message', async (req, res) => {
  const messages = await client.lrange('messages', 0, -1);
  res.send(messages);
});

app.post('/user', async (req, res) => {
  const user = req.body.user;
  await clientPG.query('INSERT INTO users (username) VALUES ($1)', [user]);
  res.send('User added');
});

app.get('/user', async (req, res) => {
  const users = await clientPG.query('SELECT * FROM users');
  res.send(users.rows);
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
