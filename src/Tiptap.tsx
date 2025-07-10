import {
  useEditor,
  EditorContent,
  type EditorEvents,
  Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import "./Tiptap.css";
import { useCallback, useState } from "react";

const MenuBar = ({ editor }: { editor: Editor | null }) => {
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
      alert(e.message);
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "is-active" : ""}
      >
        bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "is-active" : ""}
      >
        italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive("underline") ? "is-active" : ""}
      >
        underline
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "is-active" : ""}
      >
        strike
      </button>
      <button
        onClick={() => editor.chain().focus().setColor("#F98181").run()}
        className={
          editor.isActive("textStyle", { color: "#F98181" }) ? "is-active" : ""
        }
        data-testid="setRed"
      >
        red
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
      >
        Left
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={editor.isActive({ textAlign: "center" }) ? "is-active" : ""}
      >
        Center
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
      >
        Right
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
      >
        h1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
      >
        h2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
      >
        h3
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 4 }) ? "is-active" : ""}
      >
        h4
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "is-active" : ""}
      >
        Bullet list
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "is-active" : ""}
      >
        Ordered list
      </button>
      <button
        onClick={setLink}
        className={editor.isActive("link") ? "is-active" : ""}
      >
        Set link
      </button>
      <button
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
      >
        Unset link
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        Undo
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        Redo
      </button>
    </>
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
    let html = editor.getHTML();

    if (html === "<p></p>") {
      html = "";
    }

    //onUpdateValue(html);
    setValue(html);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],
        isAllowedUri: (url, ctx) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`);

            // use default validation
            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false;
            }

            // disallowed protocols
            const disallowedProtocols = ["ftp", "file", "mailto"];
            const protocol = parsedUrl.protocol.replace(":", "");

            if (disallowedProtocols.includes(protocol)) {
              return false;
            }

            // only allow protocols specified in ctx.protocols
            const allowedProtocols = ctx.protocols.map((p) =>
              typeof p === "string" ? p : p.scheme
            );

            if (!allowedProtocols.includes(protocol)) {
              return false;
            }

            // disallowed domains
            const disallowedDomains = [
              "example-phishing.com",
              "malicious-site.net",
            ];
            const domain = parsedUrl.hostname;

            if (disallowedDomains.includes(domain)) {
              return false;
            }

            // all checks have passed
            return true;
          } catch {
            return false;
          }
        },
        shouldAutoLink: (url) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`https://${url}`);

            // only auto-link if the domain is not in the disallowed list
            const disallowedDomains = [
              "example-no-autolink.com",
              "another-no-autolink.com",
            ];
            const domain = parsedUrl.hostname;

            return !disallowedDomains.includes(domain);
          } catch {
            return false;
          }
        },
      }),
    ],
    content: value,
    onUpdate,
  });

  return (
    <div>
      <h2>Tiptap Editor</h2>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <h2>Html</h2>
      <div>{value}</div>
      <h2>Output</h2>
      <div dangerouslySetInnerHTML={{ __html: value }}></div>
    </div>
  );
};
