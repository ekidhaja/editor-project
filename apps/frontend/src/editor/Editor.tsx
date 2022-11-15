// @refresh reset // Fixes hot refresh errors in development https://github.com/ianstormtaylor/slate/issues/3477

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { createEditor, Descendant, BaseEditor, Transforms, Operation } from 'slate'
import { withHistory, HistoryEditor } from 'slate-history'
import { handleHotkeys, withLinks, withHtml } from './helpers';
import { Editable, withReact, Slate, ReactEditor } from 'slate-react' 
import { EditorToolbar } from './EditorToolbar'
import { CustomElement } from './CustomElement'
import { CustomLeaf, CustomText } from './CustomLeaf'
import io from "socket.io-client"; 
import * as Y from 'yjs';
import { withYHistory, withYjs, YjsEditor, slateNodesToInsertDelta } from '@slate-yjs/core';

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
  const renderElement = useCallback(props => <CustomElement {...props} />, []);
  const renderLeaf = useCallback(props => <CustomLeaf {...props} />, []);
  const [value, setValue] = useState<Array<Descendant>>([]);
  const remote = useRef(false);
  const socketchange = useRef(false);
  const [yDoc, setYDoc] = useState<Y.Doc>(); 

  const doc = new Y.Doc();
  const sharedType = useMemo(() => {
    const sharedType = doc.get("content", Y.XmlText) as Y.XmlText;

    // Load the initial value into the yjs document
    sharedType.applyDelta(slateNodesToInsertDelta(initialValue))
    setYDoc(doc);

    doc.on("update", (update) => {
      console.log("text changed: ", update)
      socket.emit("text-changed", { update, docId });
    });
    return sharedType;
  }, []);

  const editor = useMemo(
    () => withHtml(withLinks(withHistory(withReact(withYHistory(withYjs(createEditor(), sharedType)))))), 
    []
  );

  // Connect editor in useEffect to comply with concurrent mode requirements.
  useEffect(() => {
    //@ts-ignore
    YjsEditor.connect(editor);
    //@ts-ignore
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  //Apply changes from remote docs
  useEffect(() => {
    //join room represented by docId
    socket.emit('join', docId);

    //sync doc with updates
    socket.on(`text-changed`, ({ newValue }: { newValue: Uint8Array }) => {
      console.log("change came: ", newValue);
      Y.applyUpdate(doc, newValue)
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
    <Slate editor={editor} value={value} onChange={(value: any) => {
      setValue(value);
      
      const ops = editor.operations.filter((op: any) => {
        if(op){
          return op.type !== "set_selection"
        }

        return false;
      });

      //emit changes when user performs an operation on the editor
      if (ops.length && !remote.current && !socketchange.current) {
        //socket.emit("text-changed", { newValue: value, docId });
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

