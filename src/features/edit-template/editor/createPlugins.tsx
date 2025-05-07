import {
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react'
import {
  ParagraphPlugin,
} from '@udecode/plate-core/react'
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font/react'
import { HeadingPlugin } from '@udecode/plate-heading/react'

export const viewPlugins = [
  // Marks
  FontColorPlugin,
  FontSizePlugin,
  FontBackgroundColorPlugin,
]

export const basicMarkPlugins = [
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
] as const

export const basicElementPlugins = [
  ParagraphPlugin,
  HeadingPlugin.configure({ options: { levels: 3 }}),
] as const