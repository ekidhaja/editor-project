import express, { RequestHandler, Response } from 'express';
import { io } from "../config";
import { getNotes, getNote, addNote, updateNote, deleteNote } from "../utils";
import { NoteResponse, NotesResponse } from "../types";
import { addToStore, getFromStore, updateTitleInStore } from '../cache';

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
  let note: NoteResponse | undefined;

  try {
    //check if note in cache 
    note = getFromStore(id);

    //fetch from db if not in cache
    if(!note) {
      note = await getNote(id);

      //add to cache
      addToStore(id, note);
    }


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
    
    //update title in cache
    updateTitleInStore(req.params.id, req.body.title);
    
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

const deleteNoteHandler: RequestHandler = async (req, res: Response, next) => {

  try {
    const resObj = await deleteNote(req.params.id);
    
    if(resObj) {
      res.status(200).json(resObj);
    }
    else {
      throw Error();
    }

  }
  catch(err) {
    console.log("error deleting note");
    next(err);
  }
}

router.get('/', notesHandler);
router.get('/:id', noteHandler);
router.post('/', addNoteHandler);
router.patch('/:id', updateNoteHandler);
router.delete('/:id', deleteNoteHandler);

export default router