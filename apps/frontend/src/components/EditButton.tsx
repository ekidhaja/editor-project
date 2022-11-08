import React from 'react'
import { Button } from '@mui/material'
import { Edit } from '@mui/icons-material'

interface EditButtonProps {
    title: string;
}

const EditButton: React.FC<EditButtonProps> = ({ title }) => {
    async function editNote() {

    }

    return (
        <Button
            onMouseDown={event => {
                event.preventDefault()
                const noteName = prompt('Enter a new name for your note:', title);

                if(noteName && noteName !== title) {
                    console.log("note name changed to: ", noteName)
                }
            }}
        >
            <Edit sx={{ fontSize: 18, cursor: "pointer" }} />
        </Button>
    )
}

export default EditButton;