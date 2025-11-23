import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "??????? ????? ?????? ?? ??????",
  description: "????? ???? ?????? ?? ?????? ? ????? ????? ??????"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          background: "#0b1020",
          color: "#e6e8ee",
          margin: 0,
          minHeight: "100vh"
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px" }}>
          <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background:
                  "conic-gradient(from 180deg at 50% 50%, #6ee7ff 0deg, #9b87ff 120deg, #ff8bd6 240deg, #6ee7ff 360deg)"
              }}
            />
            <h1 style={{ margin: 0, fontSize: 20 }}>??????? ????? ????? ??????</h1>
          </header>
          {children}
          <footer style={{ marginTop: 48, opacity: 0.7, fontSize: 12 }}>
            ????????? ???? ??????? ??? Vercel
          </footer>
        </div>
      </body>
    </html>
  );
}
