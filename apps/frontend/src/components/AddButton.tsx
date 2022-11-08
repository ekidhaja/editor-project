import React from 'react'
import { Button } from '@mui/material'
import { AddCircle } from "@mui/icons-material";

const AddButton: React.FC = () => {
    async function addNewNote() {

    }

    return (
        <Button
            onMouseDown={event => {
                event.preventDefault()
                const noteName = prompt('Enter a name for your new note:')
                console.log("add button clicked", noteName)
            }}
        >
            <AddCircle sx={{ fontSize: 34, cursor: "pointer" }} />
        </Button>
    )
}

export default AddButton;