import express, { RequestHandler, Response } from 'express';
import { io } from "../config";
import { getNotes, getNote, addNote, updateNote } from "../utils";
import { NoteResponse, NotesResponse } from "../types";

const router = express.Router()

const notesHandler: RequestHandler = async (_req, res: Response<NotesResponse>, next) => {
  try {
    const notes = await getNotes();

    res.status(200).json({ notes })
  }
  catch(err) {
    console.log("error fetching notes");
    next(err);
  }
}

const noteHandler: RequestHandler = async (req, res: Response<NoteResponse>, next) => {
  const { id } = req.params;

  try {
    const note = await getNote(id);

    res.status(200).json(note);
  }
  catch(err) {
    console.log("error fetching note by id");
    next(err);
  }
}

const addNoteHandler: RequestHandler = async (req, res: Response, next) => {
  const { title } = req.body;

  try {
    const id = await addNote(title);
    

    res.status(200).json({ id });
  }
  catch(err) {
    console.log("error adding note fetching note by id");
    next(err);
  }
}

const updateNoteHandler: RequestHandler = async (req, res: Response, next) => {

  try {
    const resObj = await updateNote(req.params.id, req.body.title);
    
    if(resObj) {
      res.status(200).json(resObj);
    }
    else {
      throw Error();
    }

  }
  catch(err) {
    console.log("error adding note fetching note by id");
    next(err);
  }
}

router.get('/', notesHandler);
router.get('/:id', noteHandler);
router.post('/', addNoteHandler);
router.patch('/:id', updateNoteHandler);

export default router