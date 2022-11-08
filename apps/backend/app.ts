import express, { Request, Response, NextFunction } from 'express';
import db from "./firebase";
import cors from 'cors';
import { app, server, io } from "./config";
import apiRoutes from './routes';
import { NotesResponse } from './types';

const PORT = 3001

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
  })
)

//health check
app.get("/api/ping", async (req, res) => {
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
        newValue: data.newValue,
        ops: data.ops
    });
  });

  //listen for note title updates and notify clients to refresh
  socket.on("note-title-updated", ({ id, title }: any) => {
    socket.to(id).emit("title-changed", title);
  })

  //listen for changes in notes collection and emit to all clients
  db.collection("notes").onSnapshot((querySnapshot) => {
      var notes: any = [];
      querySnapshot.forEach((doc) => {
        const { title } = doc.data();
          notes.push({ id: doc.id, title});
      });

      socket.emit("notesList-changed", { notes });
  });

});

//handle errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    error: true,
    message: err.message
  })
}) 

server.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
  if(db) {
    console.log("connected to firestore")
  }
  else {
    console.log("could not connect to firestore")
  }
})


