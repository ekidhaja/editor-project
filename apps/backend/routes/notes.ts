import express, { RequestHandler, Response } from 'express'
import { WebsocketRequestHandler } from 'express-ws'
import { Descendant } from 'slate'
import { NOTE_1, NOTE_2 } from '../fixtures/notes'
import db from "../firebase";

// Patch `express.Router` to support `.ws()` without needing to pass around a `ws`-ified app.
// https://github.com/HenningM/express-ws/issues/86
// eslint-disable-next-line @typescript-eslint/no-var-requires
const patch = require('express-ws/lib/add-ws-method')
patch.default(express.Router)

const router = express.Router()

export interface NotesResponse {
  notes: Array<{
    id: string
    title: string
  }>
}

export interface NoteResponse {
  id: string
  title: string
  content: Array<Descendant>
}

const notesHandler: RequestHandler = async (_req, res: Response<NotesResponse>, next) => {
  try {
    const snapshot = await db.collection('notes').get();
    const notes: any = [];
    snapshot.forEach((doc) => {
      const { title } = doc.data();
      notes.push({ id: doc.id, title })
    });

    res.json({ notes })
  }
  catch(err) {
    console.log("error fetching notes");
    next(err);
  }
}

const noteHandler: RequestHandler = async (req, res: Response<NoteResponse>, next) => {
  const { id } = req.params;

  try {
    const snapshot = await db.collection('notes').get();
    const note: NoteResponse = {
      id: "",
      title: "",
      content: []
    };
    snapshot.forEach((doc) => {
      if(doc.id === id) {
        const { title, content } = doc.data();
        note.id = doc.id;
        note.title = title;
        note.content = content;
      }
    });

    res.json(note);
  }
  catch(err) {
    console.log("error fetching note by id");
    next(err);
  }
}

router.get('/', notesHandler)
// router.ws('/:id', noteHandler)
router.get('/:id', noteHandler)

export default router