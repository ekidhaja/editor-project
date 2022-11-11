import React, { useState, useEffect } from 'react'
import { Editor } from '../editor'
import { ReadyState } from 'react-use-websocket'

import { Paper, TextField, Badge, BadgeTypeMap } from '@mui/material'
import io from "socket.io-client"; 

const socket = io("http://localhost:3001");

interface SingleNoteProps {
  id: string
}

const Home: React.FC<SingleNoteProps> = ({ id }) => {
  const [note, setNote] = useState<any>(null);
  const [noteTitle, setNoteTitle] = useState<string>("");

  //fetch note by id when id changes
  useEffect(() => {
    const abortController = new AbortController();

    async function fetchNote() {
      try {
        const res = await fetch(`http://localhost:3001/api/v1/notes/${id}`, { signal: abortController.signal });
        const data = await res.json();
      
        setNote(data);
        setNoteTitle(data.title);
      }
      catch(err) {
        console.log("Could not fetch note");
      }
    }

    socket.emit('join', id);

    //listen for change in note title
    socket.on(`title-changed`, (title: string) => {
      setNoteTitle(title);
    });

    if(id) fetchNote();
    
    return () => {
      abortController.abort();
      socket.off('title-changed')
    }

  }, [id]);

  // const connectionStatusColor = {
  //   [ReadyState.CONNECTING]: 'info',
  //   [ReadyState.OPEN]: 'success',
  //   [ReadyState.CLOSING]: 'warning',
  //   [ReadyState.CLOSED]: 'error',
  //   [ReadyState.UNINSTANTIATED]: 'error',
  // }[readyState] as BadgeTypeMap['props']['color']

  return note ? (
    <>
      <Badge variant="dot" sx={{ width: '100%' }}>
        <TextField
          value={noteTitle}
          variant="standard"
          fullWidth={true}
          inputProps={{ style: { fontSize: 32, color: '#666' } }}
          sx={{ mb: 2 }}
        />
      </Badge>
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Editor initialValue={note.content} docId={id} />
      </Paper>
    </>
  ) : <div>Loading...</div>
}

export default Home