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
  const { buttonLink, imageUrl } = props.node.attrs;

  const deleteNode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    props.deleteNode();
  };

  return (
    <NodeViewWrapper className="blog-cta-wrapper relative group my-10 select-none">
      <div 
        style={{
          borderRadius: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        {imageUrl ? (
          <a href={buttonLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', pointerEvents: 'none' }}>
            <img 
              src={imageUrl} 
              alt="CTA" 
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </a>
        ) : (
          <div style={{ padding: '2rem', backgroundColor: '#f1f5f9', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.05em', textAlign: 'center' }}>
            Please configure an image for this CTA
          </div>
        )}

        {/* Action Buttons Overlay */}
        <div className="absolute top-4 right-4 z-50 flex gap-2 transition-all opacity-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={deleteNode}
            className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg border-none cursor-pointer flex items-center justify-center transition-all"
            title="Remove CTA"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/10">
          Image-Only CTA
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
      id: { 
        default: "",
        parseHTML: element => element.getAttribute('data-cta-id')
      },
      title: { 
        default: "",
        parseHTML: element => element.getAttribute('data-cta-title') || element.querySelector('h3')?.innerText
      },
      description: { 
        default: "",
        parseHTML: element => element.getAttribute('data-cta-description') || element.querySelector('p')?.innerText
      },
      buttonText: { 
        default: "Learn More",
        parseHTML: element => element.getAttribute('data-cta-button-text') || element.querySelector('a')?.innerText
      },
      buttonLink: { 
        default: "#",
        parseHTML: element => element.getAttribute('data-cta-button-link') || element.querySelector('a')?.getAttribute('href')
      },
      type: { 
        default: "primary",
        parseHTML: element => element.getAttribute('data-cta-type')
      },
      imageUrl: { 
        default: "",
        parseHTML: element => element.getAttribute('data-cta-image')
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="global-cta"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { id, buttonLink, imageUrl } = HTMLAttributes;
    
    return [
      "div",
      mergeAttributes(
        {
          "data-type": "global-cta",
          "data-cta-id": id,
          "data-cta-button-link": buttonLink,
          "data-cta-image": imageUrl,
          class: "blog-cta-node",
          style: "margin: 2.5rem 0; position: relative; overflow: hidden; border-radius: 2rem;",
        }
      ),
      [
        "a",
        {
          href: buttonLink,
          target: "_blank",
          rel: "noopener noreferrer",
          style: "display: block; width: 100%; transition: transform 0.3s ease; border-radius: 2rem; overflow: hidden;",
        },
        [
          "img",
          {
            src: imageUrl,
            alt: "Call to Action",
            style: "width: 100%; height: auto; display: block; border-radius: 2rem; object-fit: cover;",
          }
        ]
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
