// @refresh reset // Fixes hot refresh errors in development https://github.com/ianstormtaylor/slate/issues/3477

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { createEditor, Descendant, BaseEditor, Transforms } from 'slate'
import { withHistory, HistoryEditor } from 'slate-history'
import { handleHotkeys } from './helpers'

import { Editable, withReact, Slate, ReactEditor } from 'slate-react'
import { EditorToolbar } from './EditorToolbar'
import { CustomElement } from './CustomElement'
import { CustomLeaf, CustomText } from './CustomLeaf'

import io from "socket.io-client"; 

const socket = io("http://localhost:3001");

// Slate suggests overwriting the module to include the ReactEditor, Custom Elements & Text
// https://docs.slatejs.org/concepts/12-typescript
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Element: CustomElement
    Text: CustomText
  }
}

interface EditorProps {
  initialValue?: Descendant[];
  placeholder?: string;
  docId?: string;
}

export const Editor: React.FC<EditorProps> = ({ initialValue = [], placeholder, docId }) => {
  const [value, setValue] = useState<Array<Descendant>>(initialValue)
  const renderElement = useCallback(props => <CustomElement {...props} />, [])
  const renderLeaf = useCallback(props => <CustomLeaf {...props} />, [])
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  const [saved, setSaved] = useState<boolean>(true);

  const remote = useRef(false);
  const socketchange = useRef(false);

  useEffect(() => {
    socket.emit('join', docId);

    socket.on(`text-changed`, ({ newValue }: any) => {
      remote.current = true;
      console.log("text recieved was: ", newValue);
      // ops.forEach((op: any) => editor.apply(op));

      // Get initial total nodes to prevent deleting affecting the loop
      let totalNodes = editor.children.length;

      // No saved content, don't delete anything to prevent errors
      if (newValue?.length) {
          // Remove every node except the last one
          // Otherwise SlateJS will return error as there's no content
          for (let i = 0; i < totalNodes - 1; i++) {
              console.log(i)
              Transforms.removeNodes(editor, {
                  at: [totalNodes-i-1],
              });
          }

          // Add content to SlateJS
          for (const val of newValue ) {
              Transforms.insertNodes(editor, val, {
                  at: [editor.children.length],
              });
          }

          // Remove the last node that was leftover from before
          Transforms.removeNodes(editor, {
              at: [0],
          });
      }

      remote.current = false;
      socketchange.current = true;
    });

    socket.on(`failed`,()=>{
      console.log('failed');
    });

    return () => {
      socket.off(`text-changed`);
      socket.off(`failed`);
    };
    
  }, [docId]);

  return (
    <Slate editor={editor} value={value} onChange={value => {
      setValue(value);
      
      const ops = editor.operations.filter(op => {
          if(op){
            return op.type !== "set_selection"
          }

          return false;
        });

        if (ops.length && !remote.current && !socketchange.current) {
          setSaved(false);
          socket.emit("text-changed", {
            newValue: value,
            docId,
            ops
          });
        }
        socketchange.current = false;
    }}>
      <EditorToolbar />
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder={placeholder}
        onKeyDown={handleHotkeys(editor)}

        // The dev server injects extra values to the editr and the console complains
        // so we override them here to remove the message
        autoCapitalize="false"
        autoCorrect="false"
        spellCheck="false"
      />
    </Slate>
  )
}