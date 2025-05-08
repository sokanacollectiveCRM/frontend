'use client';

import type { Value } from '@udecode/plate';

import { withProps } from '@udecode/cn';
import {
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { EmojiInputPlugin } from '@udecode/plate-emoji/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { ColumnItemPlugin, ColumnPlugin } from '@udecode/plate-layout/react';
import {
  ImagePlugin,
  PlaceholderPlugin
} from '@udecode/plate-media/react';
import {
  MentionPlugin
} from '@udecode/plate-mention/react';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import {
  type CreatePlateEditorOptions,
  ParagraphPlugin,
  PlateLeaf,
  usePlateEditor,
} from '@udecode/plate/react';

import { editorPlugins } from '@/components/editor/plugins/editor-plugins';
import { FixedToolbarPlugin } from '@/components/editor/plugins/fixed-toolbar-plugin';
import { FloatingToolbarPlugin } from '@/components/editor/plugins/floating-toolbar-plugin';
import { BlockquoteElement } from '@/components/plate-ui/blockquote-element';
import { ColumnElement } from '@/components/plate-ui/column-element';
import { ColumnGroupElement } from '@/components/plate-ui/column-group-element';
import { DateElement } from '@/components/plate-ui/date-element';
import { EmojiInputElement } from '@/components/plate-ui/emoji-input-element';
import { HeadingElement } from '@/components/plate-ui/heading-element';
import { HighlightLeaf } from '@/components/plate-ui/highlight-leaf';
import { HrElement } from '@/components/plate-ui/hr-element';
import { ImageElement } from '@/components/plate-ui/image-element';
import { MediaPlaceholderElement } from '@/components/plate-ui/media-placeholder-element';
import { MentionElement } from '@/components/plate-ui/mention-element';
import { ParagraphElement } from '@/components/plate-ui/paragraph-element';
import { withPlaceholders } from '@/components/plate-ui/placeholder';
import {
  TableCellElement,
  TableCellHeaderElement,
} from '@/components/plate-ui/table-cell-element';
import { TableElement } from '@/components/plate-ui/table-element';
import { TableRowElement } from '@/components/plate-ui/table-row-element';
import { ToggleElement } from '@/components/plate-ui/toggle-element';

export const viewComponents = {
  [BlockquotePlugin.key]: BlockquoteElement,
  [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
  [ColumnItemPlugin.key]: ColumnElement,
  [ColumnPlugin.key]: ColumnGroupElement,
  [DatePlugin.key]: DateElement,
  [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: 'h1' }),
  [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: 'h2' }),
  [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: 'h3' }),
  [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: 'h4' }),
  [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: 'h5' }),
  [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: 'h6' }),
  [HighlightPlugin.key]: HighlightLeaf,
  [HorizontalRulePlugin.key]: HrElement,
  [ImagePlugin.key]: ImageElement,
  [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
  [MentionPlugin.key]: MentionElement,
  [ParagraphPlugin.key]: ParagraphElement,
  [PlaceholderPlugin.key]: MediaPlaceholderElement,
  [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
  [SubscriptPlugin.key]: withProps(PlateLeaf, { as: 'sub' }),
  [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: 'sup' }),
  [TableCellHeaderPlugin.key]: TableCellHeaderElement,
  [TableCellPlugin.key]: TableCellElement,
  [TablePlugin.key]: TableElement,
  [TableRowPlugin.key]: TableRowElement,
  [TogglePlugin.key]: ToggleElement,
  [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
};

export const editorComponents = {
  ...viewComponents,
  [EmojiInputPlugin.key]: EmojiInputElement,
};

export const useCreateEditor = (
  {
    components,
    override,
    readOnly,
    ...options
  }: {
    components?: Record<string, any>;
    plugins?: any[];
    readOnly?: boolean;
  } & Omit<CreatePlateEditorOptions, 'plugins'> = {},
  deps: any[] = []
) => {
  return usePlateEditor<Value>(
    {
      override: {
        components: {
          ...(readOnly ? viewComponents : withPlaceholders(editorComponents)),
          ...components,
        },
        ...override,
      },
      plugins: [
        ...editorPlugins,
        FixedToolbarPlugin,
        FloatingToolbarPlugin,
      ],
      value: [
        {
          children: [{ text: 'Playground' }],
          type: 'h1',
        },
        {
          children: [
            { text: 'A rich-text editor with AI capabilities. Try the ' },
            { bold: true, text: 'AI commands' },
            { text: "' or use" },
            { kbd: true, text: 'Cmd+J' },
            { text: ' to open the AI menu.' },
          ],
          type: ParagraphPlugin.key,
        },
      ],
      ...options,
    },
    deps
  );
};
