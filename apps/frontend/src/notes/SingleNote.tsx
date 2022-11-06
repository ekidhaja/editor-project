import React, { useState, useEffect } from 'react'
import { Editor } from '../editor'
import { useNote } from './hooks'
import { ReadyState } from 'react-use-websocket'

import { Paper, TextField, Badge, BadgeTypeMap } from '@mui/material'

interface SingleNoteProps {
  id: string
}

const Home: React.FC<SingleNoteProps> = ({ id }) => {
  const [note, setNote] = useState<any>(null);

  useEffect(() => {
    fetchNote(id);
  }, [id])

  //fetch note by id
  async function fetchNote(id: string) {
    try {
      const res = await fetch(`http://localhost:3001/api/notes/${id}`);
      const data = await res.json();
    
      setNote(data);
    }
    catch(err) {
      console.log("Could not fetch note");
    }
  }

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
          value={note.title}
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
  ) : null
}

export default Home