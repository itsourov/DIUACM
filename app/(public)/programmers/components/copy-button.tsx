"use client";

import { Copy } from "lucide-react";

interface CopyButtonProps {
  text: string;
  platform: string;
  className?: string;
}

export function CopyButton({ text, platform, className }: CopyButtonProps) {
  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log(`${platform} handle copied: ${text}`);
    });
  };

  return (
    <button
      onClick={() => copyToClipboard(text, platform)}
      className={className || "text-current hover:opacity-70 transition-opacity"}
    >
      <Copy className="w-3 h-3" />
    </button>
  );
}