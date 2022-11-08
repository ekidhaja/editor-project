import React, { useState } from 'react'
import Link from 'next/link'
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { Assignment as AssignmentIcon } from '@mui/icons-material'
import { useNotesList } from './hooks'
import EditButton from "../components/EditButton";

interface NotesListProps {
  activeNoteId?: string
}

const NotesList: React.FC<NotesListProps> = ({ activeNoteId }) => {
  const { notesList } = useNotesList();

  return (
    <List>
      {notesList?.map((note) => (
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
            <EditButton title={note.title} />
          </ListItemIcon>
        </ListItem>
      ))}
    </List>
  )
}

export default NotesList