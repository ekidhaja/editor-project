import React from 'react'
import { Button } from '@mui/material'
import { Edit } from '@mui/icons-material';
import io from "socket.io-client"; 

const socket = io("http://localhost:3001");

interface EditButtonProps {
    id: string;
    title: string;
}

const EditButton: React.FC<EditButtonProps> = ({ id, title }) => {

    async function updateNote(newTitle: string) {
        try {
            //make put request to update note
            const res = await fetch(`http://localhost:3001/api/notes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'title': `${newTitle}`
                }),
            });

            //emit message to server to notify clients currently viewing note to refresh title;
            if(res) {
                socket.emit("note-title-updated", {id, title: newTitle });
            }
            else {
                throw Error();
            }
        }
        catch(err) {
            console.log("Error updating note title");
        }
    }

    return (
        <Button
            onMouseDown={event => {
                event.preventDefault()
                const noteName = prompt('Enter a new name for your note:', title);

                if(noteName && noteName !== title) {
                    updateNote(noteName);
                }
            }}
        >
            <Edit sx={{ fontSize: 18, cursor: "pointer" }} />
        </Button>
    )
}

export default EditButton;