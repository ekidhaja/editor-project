import { Descendant } from 'slate'

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