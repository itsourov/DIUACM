"use client";

export function ResponsiveTableContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="overflow-x-auto">{children}</div>;
}
