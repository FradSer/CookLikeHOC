import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🍳 做菜问答助手",
  description: "专业的烹饪问答 AI 助手，帮你解决所有做菜相关的问题",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
