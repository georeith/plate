import {
  InsertNodesOptions,
  isExpanded,
  isSelectionAtBlockStart,
  someNode,
  wrapNodes,
} from '@udecode/slate-plugins-common';
import { getPluginType, SPEditor, TElement } from '@udecode/slate-plugins-core';
import { Transforms } from 'slate';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from '../defaults';

/**
 * Insert a code block: set the node to code line and wrap it with a code block.
 * If the cursor is not at the block start, insert break before.
 */
export const insertCodeBlock = (
  editor: SPEditor,
  insertNodesOptions: Omit<InsertNodesOptions, 'match'> = {}
) => {
  if (!editor.selection || isExpanded(editor.selection)) return;

  const matchCodeElements = (node: TElement) =>
    node.type === getPluginType(editor, ELEMENT_CODE_BLOCK) ||
    node.type === getPluginType(editor, ELEMENT_CODE_LINE);

  if (
    someNode(editor, {
      match: matchCodeElements,
    })
  ) {
    return;
  }

  if (!isSelectionAtBlockStart(editor)) {
    editor.insertBreak();
  }

  Transforms.setNodes(
    editor,
    {
      type: getPluginType(editor, ELEMENT_CODE_LINE),
      children: [{ text: '' }],
    } as any,
    insertNodesOptions
  );

  wrapNodes(
    editor,
    {
      type: getPluginType(editor, ELEMENT_CODE_BLOCK),
      children: [],
    },
    insertNodesOptions
  );
};
