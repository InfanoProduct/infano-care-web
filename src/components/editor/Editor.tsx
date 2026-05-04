'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CustomImage } from './extensions/CustomImage';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Typography from '@tiptap/extension-typography';

import { 
  Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Heading3,
  Image as ImageIcon, Undo, Redo, Code, Link as LinkIcon,
  PlusCircle, Upload, Loader2, MousePointerClick,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Underline as UnderlineIcon, Strikethrough, Highlighter,
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
  CheckSquare, Type
} from 'lucide-react';
import { GlobalCta } from './extensions/GlobalCta';
import { blogService } from '@/services/blog.service';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  ctas?: any[];
}

const MenuBar = ({ editor, ctas = [] }: { editor: any, ctas?: any[] }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!editor) return null;



  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await blogService.uploadImage(file) as any;
      editor.chain().focus().setImage({ src: res.url }).run();
    } catch (error) {
      alert('Failed to upload image');
    }
  };

  const insertCta = (cta: any) => {
    editor.chain().focus().setGlobalCta({
      id: cta.id,
      title: cta.title,
      description: cta.description,
      buttonText: cta.buttonText,
      buttonLink: cta.buttonLink,
      type: cta.type || 'primary',
      imageUrl: cta.imageUrl
    }).run();
  };

  const IconButton = ({ onClick, isActive = false, title, children, activeName, activeAttributes }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg transition-all ${
        (activeName ? editor.isActive(activeName, activeAttributes) : isActive)
          ? 'bg-primary text-white shadow-md' 
          : 'hover:bg-primary/10 text-slate-600'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-1 p-3 bg-secondary/30 border-b border-primary/10 rounded-t-2xl">
      {/* History */}
      <div className="flex gap-1 pr-2 border-r border-primary/10 mr-1">
        <IconButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={18} /></IconButton>
      </div>

      {/* Headings */}
      <div className="flex gap-1 pr-2 border-r border-primary/10 mr-1">
        <IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} activeName="heading" activeAttributes={{ level: 1 }} title="Heading 1"><Heading1 size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} activeName="heading" activeAttributes={{ level: 2 }} title="Heading 2"><Heading2 size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} activeName="heading" activeAttributes={{ level: 3 }} title="Heading 3"><Heading3 size={18} /></IconButton>
      </div>

      {/* Basic Marks */}
      <div className="flex gap-1 pr-2 border-r border-primary/10 mr-1">
        <IconButton onClick={() => editor.chain().focus().toggleBold().run()} activeName="bold" title="Bold"><Bold size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleItalic().run()} activeName="italic" title="Italic"><Italic size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleUnderline().run()} activeName="underline" title="Underline"><UnderlineIcon size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleStrike().run()} activeName="strike" title="Strike"><Strikethrough size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleHighlight().run()} activeName="highlight" title="Highlight"><Highlighter size={18} /></IconButton>
      </div>

      {/* Sub/Superscript */}
      <div className="flex gap-1 pr-2 border-r border-primary/10 mr-1">
        <IconButton onClick={() => editor.chain().focus().toggleSubscript().run()} activeName="subscript" title="Subscript"><SubscriptIcon size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleSuperscript().run()} activeName="superscript" title="Superscript"><SuperscriptIcon size={18} /></IconButton>
      </div>

      {/* Alignment */}
      <div className="flex gap-1 pr-2 border-r border-primary/10 mr-1">
        <IconButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Align Justify"><AlignJustify size={18} /></IconButton>
      </div>

      {/* Lists */}
      <div className="flex gap-1 pr-2 border-r border-primary/10 mr-1">
        <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()} activeName="bulletList" title="Bullet List"><List size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()} activeName="orderedList" title="Numbered List"><ListOrdered size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleTaskList().run()} activeName="taskList" title="Task List"><CheckSquare size={18} /></IconButton>
      </div>

      {/* Nodes */}
      <div className="flex gap-1 pr-2 border-r border-primary/10 mr-1">
        <IconButton onClick={() => editor.chain().focus().toggleBlockquote().run()} activeName="blockquote" title="Quote"><Quote size={18} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} activeName="codeBlock" title="Code Block"><Code size={18} /></IconButton>
        <IconButton onClick={setLink} activeName="link" title="Link"><LinkIcon size={18} /></IconButton>
      </div>

      {/* Media */}
      <div className="flex gap-1 pr-2 border-r border-primary/10 mr-1">
        <IconButton onClick={() => fileInputRef.current?.click()} title="Insert Image">
          <ImageIcon size={18} />
        </IconButton>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      </div>

      {/* CTA Insert */}
      {ctas.length > 0 && (
        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-2 p-2 px-3 rounded-lg bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-all h-full"
          >
            <PlusCircle size={16} />
            Insert CTA
          </button>
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-primary/10 rounded-xl shadow-2xl z-50 hidden group-hover:block p-2 animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground p-2 border-b border-border mb-1">Available CTAs</p>
            <div className="max-h-48 overflow-y-auto">
              {ctas.map(cta => (
                <button
                  key={cta.id}
                  type="button"
                  onClick={() => insertCta(cta)}
                  className="w-full text-left p-2 hover:bg-primary/5 rounded-lg transition-all"
                >
                  <p className="text-sm font-bold truncate">{cta.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{cta.buttonText}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Editor({ content, onChange, ctas = [] }: EditorProps) {
  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph', 'image'],
    }),
    Highlight.configure({ multicolor: true }),
    TaskList.configure(),
    TaskItem.configure({
      nested: true,
    }),
    Subscript.configure(),
    Superscript.configure(),
    Typography.configure(),
    CustomImage,
    GlobalCta,
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary underline font-bold cursor-pointer',
      },
    }),
  ], [ctas]); // Only recompute if CTAs change

  const editor = useEditor({
    extensions,
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[500px] p-8 max-w-none font-medium leading-relaxed',
      },
    },
  });

  // Update editor content when prop changes (hydration)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const timer = setTimeout(() => {
        editor.commands.setContent(content);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [content, editor]);

  return (
    <div className="bg-white border border-primary/10 rounded-[2rem] overflow-hidden focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-inner">
      <MenuBar editor={editor} ctas={ctas} />
      <div className="p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
