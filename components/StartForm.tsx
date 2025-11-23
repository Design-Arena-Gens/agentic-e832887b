"use client";
import { useState } from "react";

export default function StartForm() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error("??? ?? ????? ??? ????");
      setText("");
    } catch (err: any) {
      setError(err?.message || "???? ??????");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      <textarea
        className="input"
        rows={4}
        placeholder="????? ??? ??? ?? ???????..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="btn" disabled={loading}>
          {loading ? "?? ??? ??????..." : "????? ?? ?????? ? ?????"}
        </button>
        {error ? <span className="status error">{error}</span> : null}
      </div>
    </form>
  );
}
