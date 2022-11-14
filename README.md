## Repository structure

We follow the monorepo pattern:

- [apps](apps) contains executable and deployable packages:
  - [frontend](apps/frontend) contains the user facing Next.JS app.
  - [backend](apps/backend) contains the backend express app.

## How to run the system

Start the dev server on [http://localhost:3000](http://localhost:3000) by running **`npm run dev`** in the root folder.

## Type checking and linting

Each app has a `check` script that runs the linting and typechecking. Run it in all apps from the root by running: `npm run check --workspaces`.

## Features

- Rich-text editing with support for formating such as Bold, Italic, Underline, etc.
- Realtime collaboration with changes transmitted to all connected clients.
- Ability to created new notes.
- Ability to edit note titles and all connected clients will see changes.
- Ability to paste formated text and the original formating is retained.
- Ability to add and visit hyperlinks.

## Tech Stack

- **TypeScript** as the programming language.
- **ReactJS** on the frontend and **ExpressJS + NodeJS** on the backend.
- **MaterialUI** for styling
- **SlateJS** as primary text editor.
- **Socket.IO** for emitting and receiving real-time changes to editor.
- **Firestore** for Database storage.
- **Slate-yjs/core** for editor shared types.
- **Yjs** for crdt syncing.

## Challenges, Implementation, and optimization

  #### How to implement rich-text editing

  Slatejs was used as the primary editor. It supports rich-text editing out-of-the-box. Different formating can be added, cuch as Bold, Italics, Underline, Bulleted-list, Numbered-list, etc.

  #### How to transmit changes made in editor to other clients in real-time

  This was done using Socket.io on the backend, and socket.io-client on the frontend. When a client opens a note, they join a room represented by docId of the note, and they start receiving real-time changes made to that note.

  #### How to save real-time changes to Database

  Every keystroke on the editor is transmitted in real-time to other connected clients by socket.io on the backend. It was impractical to make a call to the database on every keystroke, as that would be very expensive to make on the database and also hugely affect performance.

  So, some kind of caching layer was needed on the backend to gather real-time keystroke changes, and store to database in batches, while also not affecting the real-time transmittion to connected clients.
  An in-memory store was created using Javascript Map data structure. A Map data structure was used because it is very efficient and has insertion and retrieval time of O(1). In production, this Map data structure can be replaced with a redis cache or similar caching technologies.
  
  Notes that are currently active are temporarily stored in-memory and all keystroke changes are synced with it. A service worker is simulated using a Javascript setInterval function that runs in the background to collect the changes stored in-memory and persist it in the database in batches.

  #### How to improve load times of notes

  Notes are fetched directly from the database every time the page reloads or refreshes. This is not optimal, especially if many clients are trying to access the same note. The in-memory cache is also useful here for optimizing load times. When a call is made to fetch a note, the controller first checks to see if note is already in cache and then returns it, if not, it then retrieves it from the database, returns it to the user, and inserts it in cache for subsequent calls.

  #### How to sync merge changes to a note from multiple clients

  The idea is to use the Yjs library, which is a crdt implementation, to sync updates made to a note by multiple collaborating clients. A function should exist on the backend that takes a new update from a client and merges it with the copy in-memory using the Yjs library, in order to resolve merge conflicts.

## Pending work

- Merge notes/state utilizing Yjs crdt library
