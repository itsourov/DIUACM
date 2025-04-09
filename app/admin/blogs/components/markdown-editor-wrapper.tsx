"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
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

// Dynamically import the MDEditor component for client-side rendering
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

// Import the math plugins directly
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export default function MarkdownEditorWrapper({
  value,
  onChange,
}: MarkdownEditorProps) {
  // Handle client-side rendering of the Markdown editor

  useEffect(() => {
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
  }, []);

  return (
    <div data-color-mode="light">
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
      />
    </div>
  );
}
