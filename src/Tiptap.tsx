import {
  useEditor,
  EditorContent,
  type EditorEvents,
  Editor,
  mergeAttributes,
  Extension,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Emoji, { emojis } from "@tiptap/extension-emoji";
import Image from "@tiptap/extension-image";
import "./Tiptap.css";
import { useCallback, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Paintbrush,
  Zap,
  ImageIcon,
} from "lucide-react";
import Paragraph from "@tiptap/extension-paragraph";
import { Plugin, PluginKey } from "prosemirror-state";

const MenuButton = ({
  onClick,
  icon: Icon,
  active = false,
  disabled = false,
  label,
}: {
  onClick: () => void;
  icon: React.ElementType;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`toolbar-button ${active ? "active" : ""}`}
    title={label}
  >
    <Icon size={18} />
  </button>
);

const OfficePaste = Extension.create({
  name: "office-paste",

  addProseMirrorPlugins() {
    return [OfficePastePlugin];
  },
});

const OfficePastePlugin = new Plugin({
  key: new PluginKey("office-paste"),
  props: {
    transformPastedHTML(html: string): string {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      doc.querySelectorAll("[style]").forEach((el) => {
        const style = el.getAttribute("style");
        if (!style) return;

        const cleaned = style
          .split(";")
          .map((part) => part.trim())
          .filter(
            (part) =>
              part &&
              !/^color\s*:/.test(part) &&
              !/^background(-color)?\s*:/.test(part)
          )
          .join("; ");

        if (cleaned) {
          el.setAttribute("style", cleaned);
        } else {
          el.removeAttribute("style");
        }
      });

      return doc.body.innerHTML;
    },
  },
});

export const CustomParagraph = Paragraph.extend({
  renderHTML({ node, HTMLAttributes }) {
    const isEmpty = node.content.size === 0;
    // Output &nbsp; for empty paragraphs in HTML export
    return ["p", HTMLAttributes, isEmpty ? "\u00A0" : 0];
  },

  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      const dom = document.createElement("p");

      // Apply TipTap-provided attributes like style/class
      Object.assign(dom, mergeAttributes(HTMLAttributes));

      // Insert <br> if empty so caret shows in editor
      if (node.content.size === 0) {
        dom.appendChild(document.createElement("br"));
      }

      // Let ProseMirror handle selection etc.
      return {
        dom,
        contentDOM: dom,
      };
    };
  },
});

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const addImage = useCallback(() => {
    if (!editor) {
      return null;
    }

    const url = window.prompt("URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) {
      return null;
    }

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    try {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="toolbar">
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        icon={Bold}
        active={editor.isActive("bold")}
        label="Bold"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        icon={Italic}
        active={editor.isActive("italic")}
        label="Italic"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        icon={UnderlineIcon}
        active={editor.isActive("underline")}
        label="Underline"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        icon={Strikethrough}
        active={editor.isActive("strike")}
        label="Strikethrough"
      />
      <MenuButton
        onClick={() => editor.chain().focus().setColor("#F98181").run()}
        icon={Paintbrush}
        active={editor.isActive("textStyle", { color: "#F98181" })}
        label="Red"
      />

      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        icon={AlignLeft}
        active={editor.isActive({ textAlign: "left" })}
        label="Align left"
      />
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        icon={AlignCenter}
        active={editor.isActive({ textAlign: "center" })}
        label="Align center"
      />
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        icon={AlignRight}
        active={editor.isActive({ textAlign: "right" })}
        label="Align right"
      />

      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        icon={Heading1}
        active={editor.isActive("heading", { level: 1 })}
        label="Heading 1"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        icon={Heading2}
        active={editor.isActive("heading", { level: 2 })}
        label="Heading 2"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        icon={Heading3}
        active={editor.isActive("heading", { level: 3 })}
        label="Heading 3"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        icon={Heading4}
        active={editor.isActive("heading", { level: 4 })}
        label="Heading 4"
      />

      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        icon={List}
        active={editor.isActive("bulletList")}
        label="Bullet list"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        icon={ListOrdered}
        active={editor.isActive("orderedList")}
        label="Ordered list"
      />

      <MenuButton
        onClick={setLink}
        icon={LinkIcon}
        active={editor.isActive("link")}
        label="Set link"
      />
      <MenuButton
        onClick={() => editor.chain().focus().unsetLink().run()}
        icon={Unlink}
        disabled={!editor.isActive("link")}
        label="Unset link"
      />
      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        icon={Undo2}
        disabled={!editor.can().undo()}
        label="Undo"
      />
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        icon={Redo2}
        disabled={!editor.can().redo()}
        label="Redo"
      />
      <MenuButton
        onClick={() => editor.chain().focus().setEmoji("zap").run()}
        icon={Zap}
        label="Zap Emoji"
      />
      <MenuButton onClick={addImage} icon={ImageIcon} label="Insert Image" />
    </div>
  );
};

export const Tiptap = () => {
  const [value, setValue] = useState(`
        <h3 style="text-align:center">
          Devs Just Want to Have Fun by Cyndi Lauper
        </h3>
        <p style="text-align:center">
          I come home in the morning light<br>
          My mother says,<br>
          Oh mother dear we’re not the fortunate ones<br>
          And devs, they wanna have fun<br>
          Oh devs just want to have fun</p>
        <p style="text-align:center">
          The phone rings in the middle of the night<br>
          My father yells, "What you gonna do with your life?"<br>
          Oh daddy dear, you know you’re still number one<br>
          But <s>girls</s>devs, they wanna have fun<br>
          Oh devs just want to have
        </p>
        <p style="text-align:center">
          That’s all they really want<br>
          Some fun<br>
          When the working day is done<br>
          Oh devs, they wanna have fun<br>
          Oh devs just wanna have fun<br>
          (devs, they wanna, wanna have fun, devs wanna have)
        </p>
      `);
  const onUpdate = ({ editor }: EditorEvents["update"]) => {
    setValue(editor.getHTML());
  };

  const editor = useEditor({
    shouldRerenderOnTransaction: true, // re-render on every transaction so the toolbar updates
    extensions: [
      StarterKit.configure({
        paragraph: false, // disable default paragraph
        trailingNode: false, // this will not add an empty paragraph after an image
      }),
      CustomParagraph,
      OfficePaste,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Emoji.configure({
        emojis: emojis,
        enableEmoticons: true,
      }),
      Image,
    ],
    content: value,
    onUpdate,
    onCreate({ editor }) {
      // Save original getHTML
      const originalGetHTML = editor.getHTML.bind(editor);

      // Override getHTML
      editor.getHTML = () => {
        const doc = editor.state.doc;

        const isOnlyEmptyParagraph =
          doc.childCount === 1 &&
          doc.firstChild?.type.name === "paragraph" &&
          doc.firstChild.content.size === 0;

        return isOnlyEmptyParagraph ? "" : originalGetHTML();
      };
    },
  });

  return (
    <div>
      <h2>Tiptap Editor</h2>
      <MenuBar editor={editor} />
      <EditorContent className="tiptap-editor" editor={editor} />
      <h2>Html</h2>
      <div>{value}</div>
      <h2>Output</h2>
      <div dangerouslySetInnerHTML={{ __html: value }}></div>
    </div>
  );
};
