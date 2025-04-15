"use client";

const LocalTime = () => {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return <span suppressHydrationWarning>{time}</span>;
};

export default LocalTime;
