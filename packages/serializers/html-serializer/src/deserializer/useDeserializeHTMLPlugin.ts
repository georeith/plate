import {
  isBlockAboveEmpty,
  SlateDocumentFragment,
} from '@udecode/slate-plugins-common';
import {
  getInlineTypes,
  getSlatePluginWithOverrides,
  SlatePlugin,
  SPEditor,
  WithOverride,
} from '@udecode/slate-plugins-core';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { deserializeHTMLToDocumentFragment } from './utils/deserializeHTMLToDocumentFragment';

export interface WithDeserializeHTMLOptions {
  plugins?: SlatePlugin[];

  /**
   * Function called before inserting the deserialized html.
   * Default: if the block above is empty and the first fragment node type is not inline,
   * set the selected node type to the first fragment node type.
   */
  preInsert?: (fragment: SlateDocumentFragment) => SlateDocumentFragment;

  /**
   * Function called to insert the deserialized html.
   * Default: {@link Transforms.insertFragment}.
   */
  insert?: (fragment: SlateDocumentFragment) => void;
}

/**
 * Enables support for deserializing inserted content from HTML format to Slate format.
 */
export const withDeserializeHTML = ({
  plugins = [],
  ...options
}: WithDeserializeHTMLOptions = {}): WithOverride<ReactEditor & SPEditor> => (
  editor
) => {
  const { insertData } = editor;

  const {
    preInsert = (fragment) => {
      const inlineTypes = getInlineTypes(editor, plugins);

      const firstNodeType = fragment[0].type as string | undefined;

      // replace the selected node type by the first block type
      if (
        isBlockAboveEmpty(editor) &&
        firstNodeType &&
        !inlineTypes.includes(firstNodeType)
      ) {
        Transforms.setNodes(editor, { type: fragment[0].type } as any);
      }

      return fragment;
    },

    insert = (fragment) => {
      Transforms.insertFragment(editor, fragment);
    },
  } = options;

  editor.insertData = (data: DataTransfer) => {
    const html = data.getData('text/html');

    if (html) {
      const { body } = new DOMParser().parseFromString(html, 'text/html');

      let fragment = deserializeHTMLToDocumentFragment(editor, {
        plugins,
        element: body,
      });

      fragment = preInsert(fragment);

      insert(fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};

/**
 * @see {@link withDeserializeHTML}
 */
export const useDeserializeHTMLPlugin = getSlatePluginWithOverrides(
  withDeserializeHTML
);
