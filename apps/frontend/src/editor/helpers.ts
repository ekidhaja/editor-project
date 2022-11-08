import { Editor, Transforms, Element as SlateElement, Range, Descendant } from 'slate'
import isHotkey from 'is-hotkey'
import { KeyboardEvent } from 'react'
import { CustomElementType } from './CustomElement'
import { CustomText } from './CustomLeaf'
// import isUrl from "is-url";


const LIST_TYPES = ['numbered-list', 'bulleted-list'];

type LinkElement = { type: 'link'; url: string; children: Descendant[] }

export const toggleBlock = (editor: Editor, format: CustomElementType): void => {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: n =>
      LIST_TYPES.includes(
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type as any // eslint-disable-line @typescript-eslint/no-explicit-any
      ),
    split: true,
  })
  const newProperties: Partial<SlateElement> = {
    type: isActive ? CustomElementType.paragraph : isList ? CustomElementType.listItem : format,
  }
  Transforms.setNodes(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

export const toggleMark = (editor: Editor, format: keyof CustomText): void => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

export const isBlockActive = (editor: Editor, format: CustomElementType): boolean => {
  const [match] = Editor.nodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  })

  return !!match
}

export const isMarkActive = (editor: Editor, format: keyof CustomText): boolean => {
  const marks = Editor.marks(editor)
  return marks ? format in marks === true : false
}

const HOTKEYS: Record<string, keyof CustomText> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}

export const handleHotkeys = (editor: Editor) => (event: KeyboardEvent<HTMLDivElement>): void => {
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event)) {
      event.preventDefault()
      const mark = HOTKEYS[hotkey]
      toggleMark(editor, mark)
    }
  }
}

export const withLinks = (editor: any) => {
  const { insertData, insertText, isInline } = editor

  editor.isInline = (element: any) => {
    return element.type === 'link' ? true : isInline(element)
  }

  editor.insertText = (text: string) => {
    if (text ) {
      wrapLink(editor, text)
    } else {
      insertText(text)
    }
  }

  editor.insertData = (data: any) => {
    const text = data.getData('text/plain')

    if (text ) {
      wrapLink(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

export const isLinkActive: any = (editor: any) => {
  const [link] = Editor.nodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === 'link',
  })
  return !!link
}

export const insertLink = (editor: any, url: string) => {
  if (editor.selection) {
    wrapLink(editor, url)
  }
}

export const unwrapLink = (editor: any) => {
  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === 'link',
  })
}

export const wrapLink = (editor: any, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor)
  }

  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  const link: any | LinkElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, link)
  } else {
    Transforms.wrapNodes(editor, link, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}