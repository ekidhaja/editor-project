import { slateNodesToInsertDelta, yTextToSlateElement } from '@slate-yjs/core';
import * as Y from 'yjs';
import { Descendant } from "slate";
import db from "../firebase";
import { NoteResponse } from "../types";
import { getFromStore, updateContentInStore } from '../cache';

const blankNoteContent = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    }
] as unknown as Array<Descendant>

export async function getNotes() {
    const snapshot = await db.collection('notes').get();
    const notes: any = [];

    snapshot.forEach((doc) => {
      const { title } = doc.data();
      notes.push({ id: doc.id, title })
    });

    return notes;
}

//get note
export async function getNote(id: string) {
    const doc = await db.collection('notes').doc(id).get();
    const note = doc.data() as NoteResponse;
    note.id = doc.id;

    return note;
}

export async function addNote(title: string) {
    const { id } = await db.collection("notes").add({
        title,
        content: blankNoteContent
    });

    return id;
}

export async function updateNote(id: string, title: string) {
    const res = await db.collection("notes").doc(id).update({ title });

    return res;
}

export async function deleteNote(id: string) {
    const res = await db.collection("notes").doc(id).delete();

    return res;
}

export function syncNote(docId: string, noteUpdate: Descendant[]) {
    //get note from cache
    const noteObj = getFromStore(docId);
    const noteCached = noteObj?.content as Descendant [];

    try {
        //create ydocs for noteUpdate and noteCached
        const yDoc1 = new Y.Doc();
        const yNoteCached = yDoc1.get("content", Y.XmlText) as unknown as Y.XmlText;
        const yDoc2 = new Y.Doc();
        const yNoteUpdated = yDoc2.get("content", Y.XmlText) as unknown as Y.XmlText;

        //convert noteUpdate and noteCached from slate to ydoc
        yNoteCached.applyDelta(slateNodesToInsertDelta(noteCached));
        yNoteUpdated.applyDelta(slateNodesToInsertDelta(noteUpdate));

        //sync noteUpdate with note in cache
        //const state1 = Y.encodeStateAsUpdate(yDoc2);
        //const state2 = Y.encodeStateAsUpdate(yDoc2);
        //Y.applyUpdate(yDoc1, state1);
        //Y.applyUpdate(yDoc2, state1);


        //convert yDoc back to slate type
        const { children } = yTextToSlateElement(yNoteUpdated);

        //update synced note changes in cache
        //updateContentInStore(docId, children);

        return children;
    }
    catch(err: any) {
        console.log("Error occured while syncing notes: ", err.message)
    }
}