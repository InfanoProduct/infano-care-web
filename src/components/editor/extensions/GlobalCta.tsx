import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React from "react";
import { Trash2 } from "lucide-react";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    globalCta: {
      setGlobalCta: (attrs: any) => ReturnType;
    };
  }
}

const CtaComponent = (props: any) => {
  const { title, description, buttonText, type, imageUrl } = props.node.attrs;
  const bg = type === "secondary" ? "#d940af" : type === "info" ? "#3b82f6" : "#6344d4";

  const deleteNode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    props.deleteNode();
  };

  return (
    <NodeViewWrapper className="blog-cta-wrapper relative group my-10">
      <div 
        style={{
          padding: '3.5rem 2rem',
          borderRadius: '2.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          color: 'white',
          backgroundImage: imageUrl ? `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('${imageUrl}')` : 'none',
          backgroundColor: imageUrl ? 'transparent' : bg,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '2.25rem', fontWeight: 900, lineHeight: 1.1 }}>{title || 'CTA Title'}</h3>
          {description && <p style={{ margin: '0 0 2rem 0', opacity: 0.9, fontSize: '1.125rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', fontWeight: 500 }}>{description}</p>}
          <div 
            style={{
              display: 'inline-block',
              background: 'white',
              color: imageUrl ? '#111' : bg,
              padding: '1rem 3rem',
              borderRadius: '1.25rem',
              fontWeight: 900,
              fontSize: '1rem',
              boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {buttonText}
          </div>
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-6 right-6 z-50 flex gap-2 transition-all opacity-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={deleteNode}
            className="p-3 bg-red-600 text-white rounded-2xl shadow-2xl hover:bg-red-700 transition-all border-none cursor-pointer flex items-center justify-center"
            title="Remove CTA"
            style={{ 
              boxShadow: '0 10px 20px rgba(220, 38, 38, 0.4)',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={20} />
          </button>
        </div>
        
        <div className="absolute top-6 left-6 px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
          Interactive Component
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const GlobalCta = Node.create({
  name: "globalCta",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      id: { default: "" },
      title: { default: "" },
      description: { default: "" },
      buttonText: { default: "Learn More" },
      buttonLink: { default: "#" },
      type: { default: "primary" },
      imageUrl: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="global-cta"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { id, title, description, buttonText, buttonLink, type, imageUrl } = HTMLAttributes;
    const bg = type === "secondary" ? "#d940af" : type === "info" ? "#3b82f6" : "#6344d4";
    
    let containerStyle = `padding: 3rem 2rem; border-radius: 2rem; margin: 2.5rem 0; text-align: center; position: relative; overflow: hidden;`;
    
    if (imageUrl) {
      containerStyle += `color: white; background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${imageUrl}'); background-size: cover; background-position: center;`;
    } else {
      containerStyle += `background-color:${bg}; color:white;`;
    }
    
    return [
      "div",
      mergeAttributes(
        {
          "data-type": "global-cta",
          "data-cta-id": id,
          "data-cta-type": type,
          "data-cta-image": imageUrl,
          class: "blog-cta-node",
          style: containerStyle,
        }
      ),
      ["div", { style: "position: relative; z-index: 10;" },
        ["h3", { style: "margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 900; line-height: 1.2;" }, title],
        ...(description ? [["p", { style: "margin: 0 0 1.5rem 0; opacity: 0.9; font-size: 1.1rem; max-width: 600px; margin-left: auto; margin-right: auto;" }, description]] : []),
        [
          "a",
          {
            href: buttonLink,
            target: "_blank",
            style: `display: inline-block; background: white; color: ${imageUrl ? '#333' : bg}; padding: 1rem 2.5rem; border-radius: 1.2rem; font-weight: 900; text-decoration: none; box-shadow: 0 10px 20px rgba(0,0,0,0.1); margin-top: 1rem;`,
          },
          buttonText,
        ],
      ]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CtaComponent);
  },

  addCommands() {
    return {
      setGlobalCta:
        (attrs: any) =>
        ({ chain }) => {
          return chain().insertContent({ type: this.name, attrs }).run();
        },
    };
  },
});
