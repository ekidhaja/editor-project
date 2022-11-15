import { slateNodesToInsertDelta, yTextToSlateElement } from '@slate-yjs/core';
import * as Y from 'yjs';
import { Descendant } from "slate";
import db from "../firebase";
import { NoteResponse } from "../types";
import { getFromStore } from '../cache';

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

export function syncNote(docId: string, noteUpdate: Uint8Array) {
    //get note from cache
    const noteObj = getFromStore(docId);
    const noteCached = noteObj?.content as Descendant [];
    
    try {
            const yDoc1 = new Y.Doc();
            const yNoteCached = yDoc1.get("content", Y.XmlText) as unknown as Y.XmlText;

            yNoteCached.applyDelta(slateNodesToInsertDelta(noteCached));
            
            Y.applyUpdate(yDoc1, noteUpdate);
            console.log("syncing note: ", yDoc1);

            //convert yDoc back to slate type
            const { children } = yTextToSlateElement(yNoteCached);
            console.log("converted children are: ", children)

            //update synced note changes in cache
            //updateContentInStore(docId, children);

            return Y.encodeStateAsUpdate(yDoc1);
       // }
    }
    catch(err: any) {
        console.log("Error occured while syncing notes: ", err.message)
    }
}

export async function initNote(docId: string) {
    //get note from cache
    //const noteObj = getFromStore(docId);
    const noteObj = await getNote(docId);
    const noteCached = noteObj?.content as Descendant [];

    const yDoc = new Y.Doc();
    const sharedType = yDoc.get("content", Y.XmlText) as unknown as Y.XmlText;
    sharedType.applyDelta(slateNodesToInsertDelta(noteCached));

    return Y.encodeStateAsUpdate(yDoc);
}