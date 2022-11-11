/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useEffect } from 'react'
import useSWR from 'swr'
import { NotesResponse, NoteResponse } from '../../../backend/types';
import useWebSocket, { ReadyState } from 'react-use-websocket'

// If you want to use GraphQL API or libs like Axios, you can create your own fetcher function. 
// Check here for more examples: https://swr.vercel.app/docs/data-fetching
const fetcher = async (
  input: RequestInfo,
  init: RequestInit
) => {
  const res = await fetch(input, init);
  return res.json();
}

export const useNotesList = () => {
  const { data, error } = useSWR<NotesResponse>('http://localhost:3001/api/v1/notes', fetcher)

  return {
    notesList: data?.notes,
    isLoading: !error && !data,
    isError: error,
  }
}

export const useNote = async (id: string) => {
  try {
    const res = await fetch(`http://localhost:3001/api/v1/notes/${id}`);
    const data = await res.json();

    return { note: data }
  }
  catch(err) {
    console.log("error fetching note by id");
  }
}