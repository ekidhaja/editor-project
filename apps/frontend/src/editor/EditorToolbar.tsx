import React, { MouseEventHandler } from 'react';
import { useSlate } from 'slate-react'
import { toggleBlock, toggleMark, isBlockActive, isMarkActive, isLinkActive, insertLink, unwrapLink } from './helpers'
import { CustomElementType } from './CustomElement'
import { CustomText } from './CustomLeaf'
import { 
  FormatBold, 
  FormatItalic, 
  FormatUnderlined, 
  Code, 
  LooksOne, 
  LooksTwo, 
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Link,
  LinkOff
} from "@mui/icons-material"
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material';

interface ButtonProps {
  active: boolean
  onMouseDown: MouseEventHandler<HTMLButtonElement>
}

const Button: React.FC<ButtonProps> = ({ active, children, onMouseDown }) => (
  <button onMouseDown={onMouseDown} style={{ backgroundColor: active ? '#333' : 'white', color: active ? 'white' : '#333', border: '1px solid #eee' }}>{children}</button>
)

interface BlockButtonProps {
  format: CustomElementType
  Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>
}

const BlockButton: React.FC<BlockButtonProps> = ({ format, Icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon style={{ fontSize: 20, cursor: "pointer" }} />
    </Button>
  )
}

interface MarkButtonProps {
  format: keyof CustomText
  Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>
}


const MarkButton: React.FC<MarkButtonProps> = ({ format, Icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon style={{ fontSize: 20, cursor: "pointer" }} />
    </Button>
  )
}

const LinkButton: React.FC = () => {
  const editor = useSlate()
  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={event => {
        event.preventDefault()
        const url = window.prompt('Enter the URL of the link:')
        if (!url) return
        insertLink(editor, url)
      }}
    >
      <Link sx={{ fontSize: 20, cursor: "pointer" }} />
    </Button>
  )
}

const RemoveLinkButton: React.FC = () => {
  const editor = useSlate()

  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={event => {
        if(isLinkActive(editor)) {
          unwrapLink(editor)
        }
      }}
    >
      <LinkOff sx={{ fontSize: 20, cursor: "pointer" }} />
    </Button>
  )
}

export const EditorToolbar: React.FC = () => {
  return (
    <div className="editor-toolbar">
      <div style={{ width: "40%", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <MarkButton format="bold" Icon={FormatBold} />
        <MarkButton format="italic" Icon={FormatItalic} />   
        <MarkButton format="underline" Icon={FormatUnderlined} />
        <MarkButton format="code" Icon={Code} />
        <BlockButton format={CustomElementType.headingOne} Icon={LooksOne} />
        <BlockButton format={CustomElementType.headingTwo} Icon={LooksTwo} />
        <BlockButton format={CustomElementType.blockQuote} Icon={FormatQuote} />
        <BlockButton format={CustomElementType.numberedList} Icon={FormatListNumbered} />
        <BlockButton format={CustomElementType.bulletedList} Icon={FormatListBulleted} />
        <LinkButton />
        <RemoveLinkButton />
      </div>
    </div>
  )
}
