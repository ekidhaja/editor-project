import React from 'react'
import { BaseText } from 'slate'
import { RenderLeafProps } from 'slate-react'

export interface CustomText extends BaseText {
  bold?: boolean
  code?: boolean
  italic?: boolean
  underline?: boolean
  link?: boolean
}

export const CustomLeaf: React.FC<RenderLeafProps> = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code style={{ backgroundColor: "#ccc", fontWeight: 500, padding: 1 }}>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}


