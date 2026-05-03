import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React from "react";
import { Trash2 } from "lucide-react";

const CustomImageComponent = (props: any) => {
  const { src, alt } = props.node.attrs;

  const deleteNode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    props.deleteNode();
  };

  return (
    <NodeViewWrapper className="custom-image-node relative my-8 mx-auto block max-w-full group">
      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-primary/10">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-auto block"
        />
        
        {/* Remove Button Overlay */}
        <div className="absolute top-4 right-4 z-50 flex gap-2 transition-all opacity-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={deleteNode}
            className="p-3 bg-red-600 text-white rounded-xl shadow-2xl hover:bg-red-700 transition-all border-none cursor-pointer flex items-center justify-center"
            title="Remove Image"
            style={{ 
              boxShadow: '0 10px 20px rgba(220, 38, 38, 0.4)',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Hover info */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </NodeViewWrapper>
  );
};

export const CustomImage = Node.create({
  name: "image",
  group: "block",
  inline: false,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CustomImageComponent);
  },

  addCommands() {
    return {
      setImage:
        (options: { src: string; alt?: string; title?: string }) =>
        ({ chain }) => {
          return chain().insertContent({ type: this.name, attrs: options }).run();
        },
    };
  },
});
