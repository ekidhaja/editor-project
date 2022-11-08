import React from 'react'
import { Button } from '@mui/material'
import { AddCircle } from "@mui/icons-material";
import { useRouter } from 'next/router';

const AddButton: React.FC = () => {
    const router = useRouter();

    async function addNewNote(title: string) {
        try {
            //make post request to add new note
            const res = await fetch('http://localhost:3001/api/notes/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'title': `${title}`
                }),
            });

            //retrieve id of new note
            if(res) {
                const { id } = await res.json();

                //redirect to new note
                router.push(`/notes/${id}`);
            }
            else {
                throw Error();
            }
        }
        catch(err) {
            console.log("error adding new note");
        }
    }

    return (
        <Button
            onMouseDown={event => {
                event.preventDefault()
                const title = prompt('Enter a name for your new note:');
                
                if(title) {
                    addNewNote(title);
                }

            }}
        >
            <AddCircle sx={{ fontSize: 34, cursor: "pointer" }} />
        </Button>
    )
}

export default AddButton;