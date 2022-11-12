import { NoteResponse } from "../types";


/** An in-memory-store to temporarily store notes **
** This will serve as a cache to save realtime note changes
** This cached note changes will periodically be store in a db by a worker
** In production, this could be a redis cache and the worker could be a lambda function **/
const inMemoryStore = new Map<string, NoteResponse>();

export function addToStore(key: string, value: NoteResponse) {
    inMemoryStore.set(key, value);
}

//returns value of key or undefined if no value found
export function getFromStore(key: string) {
    return inMemoryStore.get(key);
}

export function updateTitleInStore(key: string, newTitle: string) {
    if(inMemoryStore.has(key)) {
        const note = inMemoryStore.get(key) as NoteResponse;
        inMemoryStore.set(key, { ...note, title: newTitle })
    }
}

export function updateContentInStore(key: string, newContent: any) {
    if(inMemoryStore.has(key)) {
        const note = inMemoryStore.get(key) as NoteResponse;
        inMemoryStore.set(key, { ...note, content: newContent })
    }
}

export function getStore() {
    return inMemoryStore;
}