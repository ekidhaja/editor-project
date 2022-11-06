import express from 'express'
import cors from 'cors'
import expressWs from 'express-ws'

const app = express()
const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, options);

import apiRoutes from './routes'

import { NOTE_1, NOTE_2 } from './fixtures/notes'

// const httpServer = createServer(app);
// const io = new Server(httpServer, { /* options */ });

const PORT = 3001
expressWs(app) 

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
  })
)
app.get("/api/ping", (req, res) => {
  res.status(200).json("pong");
});

app.use('/api', apiRoutes);

//websocket server
io.on("connection", (socket: any) => {

  //let clients join rooms represented by docId
  socket.on("join", async (room: any) => {
      socket.join(room);
      socket.emit("joined", room);
      socket.activeRoom = room;
  });

  // When new text changes received, broadcast new text to all client except originator
  socket.on("text-changed", (data: any) => {
    const room = data.docId;
      socket.to(room).broadcast.emit("text-changed", {
        newText: data.newText,
        ops: data.ops
    });
  });


});

server.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
})


