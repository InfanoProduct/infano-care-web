import { Node, mergeAttributes } from "@tiptap/core";

export interface CtaNodeAttrs {
  id: string;
  title: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
  type: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    globalCta: {
      setGlobalCta: (attrs: CtaNodeAttrs) => ReturnType;
    };
  }
}

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
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="global-cta"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { id, title, description, buttonText, buttonLink, type } = HTMLAttributes;
    
    // Simple inline styles to match the look
    const bg = type === "secondary" ? "#d940af" : type === "info" ? "#3b82f6" : "#6344d4";
    
    return [
      "div",
      mergeAttributes(
        {
          "data-type": "global-cta",
          "data-cta-id": id,
          "data-cta-type": type,
          class: "blog-cta-node",
          style: `background-color:${bg}; color:white; padding: 2rem; border-radius: 1.5rem; margin: 2rem 0; text-align: center;`,
        }
      ),
      ["h3", { style: "margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 900;" }, title],
      ...(description ? [["p", { style: "margin: 0 0 1.5rem 0; opacity: 0.9;" }, description]] : []),
      [
        "a",
        {
          href: buttonLink,
          target: "_blank",
          style: `display: inline-block; background: white; color: ${bg}; padding: 0.75rem 2rem; border-radius: 1rem; font-weight: 900; text-decoration: none;`,
        },
        buttonText,
      ],
    ];
  },

  addCommands() {
    return {
      setGlobalCta:
        (attrs: CtaNodeAttrs) =>
        ({ chain }) => {
          return chain().insertContent({ type: this.name, attrs }).run();
        },
    };
  },
});
