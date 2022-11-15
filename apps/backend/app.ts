import express, { Request, Response, NextFunction } from 'express';
import db from "./firebase";
import cors from 'cors';
import { app, server, io } from "./config";
import apiRoutes from './routes';
//import { dbWorker } from './workers';
import { syncNote } from './utils';

const PORT = process.env.PORT ?? 3001;

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
  })
)

function StartServer() {
  //health check
  app.get("/api/ping", async (req, res) => {
    res.status(200).json("pong");
  });

  //api routes
  app.use('/api/v1', apiRoutes);

  //start workers 
  //dbWorker(); 

  //websocket server
  io.on("connection", (socket: any) => {

    //let clients join rooms represented by docId
    socket.on("join", async (room: string) => { 
      socket.join(room);
      socket.emit("joined", room);
      socket.activeRoom = room; 
    });

    // When new text changes received, broadcast new text to all client except originator
    socket.on("text-changed", (data: any) => {
      const room = data.docId; 
      console.log("update arrived: ", data.update)
      const syncedValue = syncNote(data.docId, data.update);
      console.log("value synced: ", syncedValue);
      socket.to(room).broadcast.emit("text-changed", { newValue: syncedValue });
    });

    //listen for note title updates and notify clients to refresh
    socket.on("note-title-updated", ({ id, title }: any) => {
      socket.to(id).emit("title-changed", title);
    })

    //listen for changes in notes collection and emit to all clients
    db.collection("notes")
      .onSnapshot((querySnapshot) => {
        var notes: any = [];
        querySnapshot.forEach((doc) => {
          const { title } = doc.data();
            notes.push({ id: doc.id, title});
        });

        socket.emit("notesList-changed", { notes });
    }, (error) => {
      console.log("Error listening to firestore changes: ", error.message);
    });

  });

  //handle errors
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(400).json({
      error: true,
      message: err.message
    })
  });

}

//connect to db and start server
if(db) {
  console.log("connected to firestore");
  server.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
    StartServer();
  })
}
else {
  console.log("Server did not start because it couldn't connect to firestore DB")
}

export { app };
