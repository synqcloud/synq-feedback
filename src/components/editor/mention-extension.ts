import { Node, mergeAttributes } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import { MentionList, type MentionListHandle } from "@/components/editor/mention-list";
import { searchMentionItems, type MentionItem } from "@/lib/mention-search";

export const mentionPluginKey = new PluginKey("mention");

export const MentionNode = Node.create({
  name: "mention",
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      kind: { default: "user" },
      id: { default: null },
      label: { default: null },
      avatarUrl: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-mention-kind]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const isUser = node.attrs.kind === "user";
    const prefix = isUser ? "@" : "#";
    const wrapper = mergeAttributes(HTMLAttributes, {
      "data-mention-kind": node.attrs.kind,
      "data-mention-id": node.attrs.id,
      class: "mention-chip",
    });
    if (isUser && node.attrs.avatarUrl) {
      return [
        "span",
        wrapper,
        ["img", { src: node.attrs.avatarUrl, alt: "", class: "mention-avatar" }],
        `${prefix}${node.attrs.label}`,
      ];
    }
    return ["span", wrapper, `${prefix}${node.attrs.label}`];
  },

  renderText({ node }) {
    const prefix = node.attrs.kind === "user" ? "@" : "#";
    return `${prefix}${node.attrs.label}`;
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<MentionItem, MentionItem>({
        editor: this.editor,
        char: "@",
        pluginKey: mentionPluginKey,
        debounce: 200,
        // Post titles are multi-word, so the query needs to allow spaces
        // (e.g. typing "@Add dark" to match "Add dark mode") -- otherwise
        // the match breaks at the first space and never becomes a chip.
        allowSpaces: true,
        items: ({ query }) => searchMentionItems(query),
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: "mention",
                attrs: {
                  kind: props.kind,
                  id: props.id,
                  label: props.label,
                  avatarUrl: props.kind === "user" ? props.avatarUrl : null,
                },
              },
              { type: "text", text: " " },
            ])
            .run();
        },
        render: () => {
          let component: ReactRenderer<MentionListHandle, { items: MentionItem[]; command: (item: MentionItem) => void }> | null =
            null;
          let unmount: (() => void) | undefined;

          return {
            onStart: (props) => {
              component = new ReactRenderer(MentionList, {
                props: { items: props.items, command: props.command },
                editor: props.editor,
              });
              // @tiptap/suggestion's mount appends this element to document.body
              // with an absolute position but no z-index, so it renders behind
              // any open dialog (dialog.tsx panels sit at z-50). Lift it above.
              (component.element as HTMLElement).style.zIndex = "60";
              unmount = props.mount(component.element as HTMLElement) ?? undefined;
            },
            onUpdate: (props) => {
              component?.updateProps({ items: props.items, command: props.command });
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                unmount?.();
                return true;
              }
              return component?.ref?.onKeyDown({ event: props.event }) ?? false;
            },
            onExit: () => {
              unmount?.();
              component?.destroy();
              component = null;
            },
          };
        },
      }),
    ];
  },
});
