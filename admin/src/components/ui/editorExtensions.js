import { Extension } from '@tiptap/core';

/**
 * The formatting TipTap v2 does not ship, matching Word's Font and Paragraph
 * ribbon groups.
 *
 * Everything is written as inline CSS rather than classes, because the public
 * site renders the stored HTML directly and has no stylesheet describing these
 * choices.
 */

const BLOCK_TYPES = ['paragraph', 'heading', 'blockquote', 'listItem'];

/** Font size, carried on TextStyle so it merges with colour and family. */
export const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el) => el.style.fontSize?.replace(/['"]+/g, '') || null,
          renderHTML: (attrs) => (attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {}),
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (size) => ({ chain }) => chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }) =>
        chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

/** Underline variants (double, dotted, dashed, wavy) — Word's U dropdown. */
export const UnderlineStyle = Extension.create({
  name: 'underlineStyle',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        underlineStyle: {
          default: null,
          parseHTML: (el) => {
            const d = el.style.textDecoration || el.style.textDecorationLine;
            return d && d.includes('underline') ? el.style.textDecoration : null;
          },
          renderHTML: (attrs) => (attrs.underlineStyle ? { style: `text-decoration: ${attrs.underlineStyle}` } : {}),
        },
      },
    }];
  },
  addCommands() {
    return {
      setUnderlineStyle: (style) => ({ chain }) =>
        chain().setMark('textStyle', { underlineStyle: `underline ${style}` }).run(),
      unsetUnderlineStyle: () => ({ chain }) =>
        chain().setMark('textStyle', { underlineStyle: null }).removeEmptyTextStyle().run(),
    };
  },
});

/**
 * Block-level attributes: line spacing, indent, shading and borders.
 *
 * One extension rather than four, because they all write to the same `style`
 * attribute on the same node types — as separate extensions the last one to
 * render would overwrite the others.
 */
export const BlockFormatting = Extension.create({
  name: 'blockFormatting',
  addOptions() { return { types: BLOCK_TYPES }; },

  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        lineHeight: {
          default: null,
          parseHTML: (el) => el.style.lineHeight || null,
          renderHTML: (attrs) => (attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight}` } : {}),
        },
        indent: {
          default: null,
          parseHTML: (el) => {
            const v = parseInt(el.style.marginLeft, 10);
            return Number.isFinite(v) && v > 0 ? v : null;
          },
          renderHTML: (attrs) => (attrs.indent ? { style: `margin-left: ${attrs.indent}px` } : {}),
        },
        shading: {
          default: null,
          parseHTML: (el) => el.style.backgroundColor || null,
          renderHTML: (attrs) => (attrs.shading
            ? { style: `background-color: ${attrs.shading}; padding: 0.35em 0.6em; border-radius: 4px` }
            : {}),
        },
        blockBorder: {
          default: null,
          parseHTML: (el) => (el.style.border || el.style.borderLeft ? (el.style.border || el.style.borderLeft) : null),
          renderHTML: (attrs) => {
            if (!attrs.blockBorder) return {};
            if (attrs.blockBorder === 'left') {
              return { style: 'border-left: 3px solid #cbd5e1; padding-left: 0.75em' };
            }
            return { style: 'border: 1px solid #cbd5e1; padding: 0.5em 0.75em; border-radius: 4px' };
          },
        },
      },
    }];
  },

  addCommands() {
    // Applies to every block in the selection, so formatting a multi-paragraph
    // selection behaves the way it does in a word processor.
    const applyToBlocks = (fn) => ({ state, tr, dispatch }) => {
      const { from, to } = state.selection;
      let changed = false;
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (!BLOCK_TYPES.includes(node.type.name)) return;
        const next = fn(node.attrs);
        if (next === null) return;
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...next });
        changed = true;
      });
      if (changed && dispatch) dispatch(tr);
      return changed;
    };

    const INDENT_STEP = 40;

    return {
      setLineHeight: (value) => applyToBlocks(() => ({ lineHeight: value || null })),
      indentBlock: () => applyToBlocks((attrs) => ({
        indent: Math.min((attrs.indent || 0) + INDENT_STEP, INDENT_STEP * 8),
      })),
      outdentBlock: () => applyToBlocks((attrs) => {
        const next = Math.max((attrs.indent || 0) - INDENT_STEP, 0);
        return { indent: next || null };
      }),
      setShading: (color) => applyToBlocks(() => ({ shading: color || null })),
      setBlockBorder: (kind) => applyToBlocks(() => ({ blockBorder: kind || null })),
    };
  },
});

/**
 * Word's "Change Case" menu. Operates on the plain text of the selection, so it
 * deliberately drops any formatting that sat inside it — the same trade-off
 * Word makes when the selection spans differently styled runs.
 */
export const CHANGE_CASE = {
  upper: (s) => s.toUpperCase(),
  lower: (s) => s.toLowerCase(),
  sentence: (s) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase()),
  title: (s) => s.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase()),
  toggle: (s) => s.replace(/[a-zA-Z]/g, (c) =>
    (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())),
};

export default { FontSize, UnderlineStyle, BlockFormatting, CHANGE_CASE };
