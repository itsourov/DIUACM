"use client";

import { useEffect, useRef } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// KaTeX CSS will be loaded in useEffect

// Add MathJax interface to Window object
declare global {
  interface Window {
    MathJax: {
      tex: {
        inlineMath: Array<string[]>;
        displayMath: Array<string[]>;
        processEscapes: boolean;
        processEnvironments: boolean;
      };
      options: {
        skipHtmlTags: string[];
      };
    };
  }
}

import MDEditor, { commands } from "@uiw/react-md-editor";

// Import the math plugins directly
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { MarkdownImageUpload } from "./markdown-image-upload";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export default function MarkdownEditorWrapper({
  value,
  onChange,
}: MarkdownEditorProps) {
  // Create a ref for the textarea to access the cursor position
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // Handle image upload and insert
  const handleImageInsert = (imageUrl: string) => {
    // Create markdown image syntax
    const imageMarkdown = `![image](${imageUrl})`;

    // Get the current textarea element
    const textarea = textAreaRef.current;
    if (!textarea) {
      // If we can't access the textarea, just append the image to the end
      onChange(value ? `${value}\n\n${imageMarkdown}` : imageMarkdown);
      return;
    }

    // Get the cursor position
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Insert the image markdown at cursor position
    const newValue =
      value.substring(0, start) + imageMarkdown + value.substring(end);

    onChange(newValue);

    // Set the cursor position after the inserted image
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + imageMarkdown.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  useEffect(() => {
    // Capture the textarea reference from the markdown editor
    const captureTextArea = () => {
      const textarea = document.querySelector(
        ".w-md-editor-text-input"
      ) as HTMLTextAreaElement;
      if (textarea) {
        textAreaRef.current = textarea;
      }
    };

    // Execute the capture after a delay to ensure the editor is rendered
    const timeoutId = setTimeout(captureTextArea, 500);

    // Load KaTeX CSS dynamically on the client side
    const loadKatexCSS = async () => {
      // Create a link element for KaTeX CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
      link.integrity =
        "sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    };

    loadKatexCSS();

    // Initialize MathJax
    if (typeof window !== "undefined") {
      window.MathJax = {
        tex: {
          inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
          ],
          displayMath: [
            ["$$", "$$"],
            ["\\[", "\\]"],
          ],
          processEscapes: true,
          processEnvironments: true,
        },
        options: {
          skipHtmlTags: ["script", "noscript", "style", "textarea", "pre"],
        },
      };

      // Load MathJax script
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
      script.async = true;
      document.head.appendChild(script);
    }

    return () => clearTimeout(timeoutId);
  }, []);

  // Define the image upload command
  const imageUploadCommand = {
    name: "image-upload",
    keyCommand: "image-upload",
    buttonProps: { "aria-label": "Upload image" },
    icon: (
      <svg width="12" height="12" viewBox="0 0 20 20">
        <path
          fill="currentColor"
          d="M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 13l-6-5-2 2-4-5-4 8V4h16v11z"
        />
      </svg>
    ),
    execute: () => {
      // This is a placeholder, the actual upload is handled in the render function
    },
    render: () => {
      return <MarkdownImageUpload onImageUploaded={handleImageInsert} />;
    },
  };

  return (
    <div data-color-mode="dark">
      <MDEditor
        value={value}
        onChange={onChange}
        height={400}
        previewOptions={{
          remarkPlugins: [[remarkMath]],
          rehypePlugins: [
            [rehypeKatex, { throwOnError: false, strict: false }],
          ],
        }}
        extraCommands={[
          imageUploadCommand,
          commands.codeEdit,
          commands.codePreview,
          commands.codeLive,
          commands.fullscreen,
        ]}
      />
    </div>
  );
}
