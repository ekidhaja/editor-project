import express from 'express';

const app = express()
const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, options);

export { app, server, io };