import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { Assignment as AssignmentIcon } from '@mui/icons-material'
import { useNotesList } from './hooks'
import EditButton from "../components/EditButton";
import io from "socket.io-client"; 

const socket = io("http://localhost:3001");

interface NotesListProps {
  activeNoteId?: string
}

const NotesList: React.FC<NotesListProps> = ({ activeNoteId }) => {
  const { notesList } = useNotesList();
  const [renderList, setRenderList] = useState<any | null>(null);

  useEffect(() => {
    setRenderList(notesList);
  }, [notesList]);

  //listen for changes in notes list and refresh 
  useEffect(() => {
    socket.on("notesList-changed", ({ notes }: any) => {
      setRenderList(notes);
    });

    return () => {
      socket.off(`notesList-changed`);
    };

  }, []);

  return (
    <List>
      {renderList?.map((note: any) => (
        <ListItem disablePadding selected={note.id === activeNoteId} key={note.id}> 
          <Link href={`/notes/${note.id}`}>
            <ListItemButton>
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary={note.title} /> 
            </ListItemButton>
          </Link>
          <ListItemIcon>
            <EditButton title={note.title} id={note.id} />
          </ListItemIcon>
        </ListItem>
      ))}
    </List>
  )
}

export default NotesList