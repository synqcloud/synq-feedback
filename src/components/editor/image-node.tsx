import ImageExtension from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ExpandableImage } from "@/components/editor/expandable-image";

export const ImageNode = ImageExtension.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ExpandableImage);
  },
});
