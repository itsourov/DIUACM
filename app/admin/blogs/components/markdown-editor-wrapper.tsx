'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// Dynamically import the MDEditor component for client-side rendering
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export default function MarkdownEditorWrapper({ value, onChange }: MarkdownEditorProps) {
  // Handle client-side rendering of the Markdown editor
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="border rounded-md p-4 min-h-[200px] bg-gray-50">
        Loading editor...
      </div>
    );
  }

  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={onChange}
        height={400}
      />
    </div>
  );
}