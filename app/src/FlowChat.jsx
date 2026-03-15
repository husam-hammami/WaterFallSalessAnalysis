import { useState, useRef, useEffect } from "react";

const FlowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

function parseDataUpdate(text) {
  const match = text.match(/```data_update\s*\n([\s\S]*?)\n```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function cleanMessageText(text) {
  return text.replace(/```data_update\s*\n[\s\S]*?\n```/g, "").trim();
}

function MessageBubble({ msg, onApplyUpdate }) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <div style={{
          background: "#0f172a", color: "white", padding: "10px 14px",
          borderRadius: "12px 12px 2px 12px", maxWidth: "85%",
          fontSize: 13, lineHeight: 1.7,
        }}>
          {msg.display}
        </div>
      </div>
    );
  }

  const cleanText = cleanMessageText(msg.display);
  const dataUpdate = parseDataUpdate(msg.display);

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
      <div style={{ maxWidth: "90%" }}>
        <div style={{
          background: "#f1f5f9", color: "#0f172a", padding: "12px 16px",
          borderRadius: "12px 12px 12px 2px",
          fontSize: 13, lineHeight: 1.8,
        }}>
          {cleanText.split("\n").map((line, i) => {
            if (!line.trim()) return <br key={i} />;
            if (line.startsWith("# ")) return <div key={i} style={{ fontSize: 15, fontWeight: 700, marginTop: i > 0 ? 10 : 0, marginBottom: 4 }}>{line.replace(/^#+\s/, "")}</div>;
            if (line.startsWith("## ")) return <div key={i} style={{ fontSize: 14, fontWeight: 700, marginTop: 8, marginBottom: 4 }}>{line.replace(/^#+\s/, "")}</div>;
            if (line.startsWith("### ")) return <div key={i} style={{ fontSize: 13, fontWeight: 700, marginTop: 6, marginBottom: 2 }}>{line.replace(/^#+\s/, "")}</div>;
            if (line.startsWith("- ") || line.startsWith("* ")) return <div key={i} style={{ paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0 }}>&#8226;</span>{line.replace(/^[-*]\s/, "")}</div>;
            if (line.match(/^\d+\.\s/)) return <div key={i} style={{ paddingLeft: 12 }}>{line}</div>;
            if (line.startsWith("**") && line.endsWith("**")) return <div key={i} style={{ fontWeight: 700 }}>{line.replace(/\*\*/g, "")}</div>;
            return <div key={i}>{line.replace(/\*\*(.*?)\*\*/g, "$1")}</div>;
          })}
        </div>

        {dataUpdate && !msg.applied && (
          <button
            onClick={() => onApplyUpdate(msg.id, dataUpdate)}
            style={{
              marginTop: 8, padding: "8px 16px", borderRadius: 8,
              background: "#059669", color: "white", border: "none",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.target.style.background = "#047857"}
            onMouseLeave={e => e.target.style.background = "#059669"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Apply Changes to Dashboard
          </button>
        )}

        {msg.applied && (
          <div style={{ marginTop: 6, fontSize: 11, color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Changes applied to dashboard
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlowChat({ dashboardData, onDataUpdate }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const msgIdRef = useRef(0);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: ++msgIdRef.current, role: "user", content: text, display: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const apiMessages = [...messages, userMsg]
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, dashboardData }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error: ${res.status}`);
      }

      const data = await res.json();
      const assistantText = data.content?.[0]?.text || data.error || "No response";

      setMessages(prev => [...prev, {
        id: ++msgIdRef.current,
        role: "assistant",
        content: assistantText,
        display: assistantText,
        applied: false,
      }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyUpdate = (msgId, dataUpdate) => {
    onDataUpdate(dataUpdate);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, applied: true } : m));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "What are our top 3 growth opportunities?",
    "Compare KSA vs UAE performance",
    "Which product has the highest margin potential?",
    "Add Q2 2026 data: AED 16M revenue, 105 orders",
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 1000,
          width: 52, height: 52, borderRadius: 16,
          background: open ? "#dc2626" : "#0f172a",
          color: "white", border: "none", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s ease",
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a7 7 0 017 7c0 3-2 5.5-4 7l-3 3.5L9 16c-2-1.5-4-4-4-7a7 7 0 017-7z" />
            <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none" />
            <path d="M8 22h8" strokeWidth="2" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 88, right: 24, zIndex: 999,
          width: 420, height: "min(600px, calc(100vh - 120px))",
          background: "white", borderRadius: 16,
          boxShadow: "0 12px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 20px",
            background: "#0f172a", color: "white",
            display: "flex", alignItems: "center", gap: 12,
            flexShrink: 0,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a7 7 0 017 7c0 3-2 5.5-4 7l-3 3.5L9 16c-2-1.5-4-4-4-7a7 7 0 017-7z" />
                <circle cx="12" cy="9" r="2.5" fill="#22c55e" stroke="none" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Flow</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>AI Sales Analyst</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: 10, color: "#64748b" }}>Online</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "16px 16px 8px",
            background: "white",
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 10px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Ask me anything about your sales data</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 18 }}>I can analyze trends, compare markets, and update your dashboard with new data.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      style={{
                        padding: "8px 12px", borderRadius: 8,
                        background: "#f8fafc", border: "1px solid #e5e7eb",
                        fontSize: 12, color: "#374151", cursor: "pointer",
                        textAlign: "left", transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.target.style.background = "#f1f5f9"; e.target.style.borderColor = "#cbd5e1"; }}
                      onMouseLeave={e => { e.target.style.background = "#f8fafc"; e.target.style.borderColor = "#e5e7eb"; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} onApplyUpdate={handleApplyUpdate} />
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
                <div style={{
                  background: "#f1f5f9", padding: "12px 16px",
                  borderRadius: "12px 12px 12px 2px",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: "50%", background: "#94a3b8",
                        animation: `flowPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: "#64748b", marginLeft: 4 }}>Analyzing...</span>
                </div>
              </div>
            )}

            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 8, padding: "10px 14px", marginBottom: 14,
                fontSize: 12, color: "#dc2626",
              }}>
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "12px 16px", borderTop: "1px solid #e5e7eb",
            display: "flex", gap: 8, alignItems: "flex-end",
            background: "#fafbfc", flexShrink: 0,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your sales data..."
              rows={1}
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 10,
                border: "1px solid #d1d5db", fontSize: 13,
                resize: "none", outline: "none",
                fontFamily: "inherit", lineHeight: 1.5,
                maxHeight: 100, overflowY: "auto",
                background: "white",
              }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "#d1d5db"}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: input.trim() && !loading ? "#0f172a" : "#e5e7eb",
                color: "white", border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "background 0.15s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes flowPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}

// ==================== FULL PAGE FLOW AI ====================

function FileChip({ file, onRemove }) {
  const ext = file.name.split(".").pop().toLowerCase();
  const icons = {
    csv: { bg: "#dcfce7", color: "#16a34a", label: "CSV" },
    xlsx: { bg: "#dbeafe", color: "#2563eb", label: "XLSX" },
    xls: { bg: "#dbeafe", color: "#2563eb", label: "XLS" },
    pdf: { bg: "#fee2e2", color: "#dc2626", label: "PDF" },
    png: { bg: "#fef3c7", color: "#d97706", label: "IMG" },
    jpg: { bg: "#fef3c7", color: "#d97706", label: "IMG" },
    jpeg: { bg: "#fef3c7", color: "#d97706", label: "IMG" },
    json: { bg: "#f3e8ff", color: "#7c3aed", label: "JSON" },
    txt: { bg: "#f1f5f9", color: "#475569", label: "TXT" },
  };
  const style = icons[ext] || { bg: "#f1f5f9", color: "#475569", label: ext.toUpperCase() };

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px 4px 8px", borderRadius: 6,
      background: style.bg, border: `1px solid ${style.color}20`,
      fontSize: 12, color: style.color, fontWeight: 600,
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.3 }}>{style.label}</span>
      <span style={{ color: "#374151", fontWeight: 500, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
      <span style={{ fontSize: 10, color: "#9ca3af" }}>({(file.size / 1024).toFixed(0)}KB)</span>
      <button onClick={onRemove} style={{
        background: "none", border: "none", cursor: "pointer", padding: 0,
        color: "#9ca3af", fontSize: 14, lineHeight: 1, marginLeft: 2,
      }}>&times;</button>
    </div>
  );
}

async function readFileContent(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ type: "image", data: reader.result, name: file.name });
      reader.readAsDataURL(file);
    });
  }

  if (["csv", "txt", "json", "tsv"].includes(ext)) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ type: "text", data: reader.result, name: file.name, ext });
      reader.readAsText(file);
    });
  }

  return { type: "unsupported", name: file.name, ext };
}

export function FlowPage({ dashboardData, onDataUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const msgIdRef = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && files.length === 0) || loading) return;

    // Process files
    let fileContents = [];
    if (files.length > 0) {
      fileContents = await Promise.all(files.map(readFileContent));
    }

    // Build display text
    const fileNames = files.map(f => f.name);
    const displayText = text + (fileNames.length > 0 ? `\n[Attached: ${fileNames.join(", ")}]` : "");

    // Build the content for Claude
    let messageContent = "";
    if (fileContents.length > 0) {
      const textFiles = fileContents.filter(f => f.type === "text");
      const imageFiles = fileContents.filter(f => f.type === "image");

      if (textFiles.length > 0) {
        messageContent += textFiles.map(f => `\n--- FILE: ${f.name} ---\n${f.data}\n--- END FILE ---`).join("\n");
      }
      if (imageFiles.length > 0) {
        messageContent += "\n[Images attached — please analyze the data shown in them]";
      }
    }
    messageContent = text + messageContent;

    const userMsg = { id: ++msgIdRef.current, role: "user", content: messageContent, display: displayText };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setFiles([]);
    setLoading(true);
    setError(null);

    try {
      const apiMessages = [...messages, userMsg]
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, dashboardData }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error: ${res.status}`);
      }

      const data = await res.json();
      const assistantText = data.content?.[0]?.text || data.error || "No response";

      setMessages(prev => [...prev, {
        id: ++msgIdRef.current,
        role: "assistant",
        content: assistantText,
        display: assistantText,
        applied: false,
      }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyUpdate = (msgId, dataUpdate) => {
    onDataUpdate(dataUpdate);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, applied: true } : m));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const quickActions = [
    { label: "Upload sales report", icon: "upload", action: () => fileInputRef.current?.click() },
    { label: "Generate new SWOT", icon: "refresh", prompt: "Based on the current data, generate an updated SWOT analysis with fresh insights. Focus on any changes in market dynamics." },
    { label: "Full market analysis", icon: "chart", prompt: "Provide a comprehensive market analysis covering: 1) Revenue trends and growth trajectory, 2) Market concentration risks, 3) Product mix optimization, 4) Geographic expansion opportunities. Be specific with numbers." },
    { label: "Forecast next quarter", icon: "trend", prompt: "Based on historical trends in the data, forecast Q2 2026 revenue, order volume, and average order value. Explain your methodology and confidence level." },
  ];

  const actionIcons = {
    upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    refresh: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
    chart: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    trend: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 0, height: "calc(100vh - 180px)", margin: "-24px -32px", background: "white" }}>
      {/* Main Chat Area */}
      <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #e5e7eb" }}
        onDragOver={e => e.preventDefault()} onDrop={handleDrop}
      >
        {/* Chat header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "#0f172a",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 017 7c0 3-2 5.5-4 7l-3 3.5L9 16c-2-1.5-4-4-4-7a7 7 0 017-7z" />
              <circle cx="12" cy="9" r="2.5" fill="#22c55e" stroke="none" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Flow AI</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Sales Intelligence Analyst — upload data, ask questions, update your dashboard</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontSize: 11, color: "#6b7280" }}>Ready</span>
          </div>
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "40px 60px" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, background: "#f1f5f9",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 017 7c0 3-2 5.5-4 7l-3 3.5L9 16c-2-1.5-4-4-4-7a7 7 0 017-7z" />
                  <circle cx="12" cy="9" r="2.5" fill="#64748b" stroke="none" />
                  <path d="M8 22h8" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Welcome to Flow AI</div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, maxWidth: 420 }}>
                Upload sales reports, CSV files, or images. Ask questions about your data. Flow will analyze everything and can update your dashboard in real-time.
              </div>
              <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {["Drag & drop files here", "CSV", "XLSX", "PDF", "Images", "JSON"].map((tag, i) => (
                  <span key={i} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500,
                    background: i === 0 ? "#f1f5f9" : "white",
                    color: i === 0 ? "#64748b" : "#9ca3af",
                    border: i === 0 ? "1px dashed #cbd5e1" : "1px solid #e5e7eb",
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} onApplyUpdate={handleApplyUpdate} />
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
              <div style={{
                background: "#f1f5f9", padding: "12px 16px",
                borderRadius: "12px 12px 12px 2px",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: "50%", background: "#94a3b8",
                      animation: `flowPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: "#64748b", marginLeft: 4 }}>Analyzing...</span>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, padding: "10px 14px", marginBottom: 14,
              fontSize: 12, color: "#dc2626",
            }}>
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* File chips */}
        {files.length > 0 && (
          <div style={{ padding: "8px 24px 0", display: "flex", flexWrap: "wrap", gap: 6 }}>
            {files.map((f, i) => (
              <FileChip key={i} file={f} onRemove={() => removeFile(i)} />
            ))}
          </div>
        )}

        {/* Input area */}
        <div style={{ padding: "12px 24px 16px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, alignItems: "flex-end" }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg,.json,.txt,.tsv"
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: "#f1f5f9", border: "1px solid #e5e7eb",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, color: "#64748b", transition: "all 0.15s",
            }}
            title="Attach files"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Flow about your data, or paste new data here..."
            rows={1}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10,
              border: "1px solid #d1d5db", fontSize: 13,
              resize: "none", outline: "none", fontFamily: "inherit",
              lineHeight: 1.5, maxHeight: 120, overflowY: "auto", background: "white",
            }}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "#d1d5db"}
            onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && files.length === 0) || loading}
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: (input.trim() || files.length > 0) && !loading ? "#0f172a" : "#e5e7eb",
              color: "white", border: "none",
              cursor: (input.trim() || files.length > 0) && !loading ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", background: "#fafbfc", overflowY: "auto" }}>
        {/* Quick Actions */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {quickActions.map((a, i) => (
              <button
                key={i}
                onClick={() => {
                  if (a.action) { a.action(); return; }
                  if (a.prompt) { setInput(a.prompt); inputRef.current?.focus(); }
                }}
                style={{
                  padding: "10px 12px", borderRadius: 8,
                  background: "white", border: "1px solid #e5e7eb",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  fontSize: 12, color: "#374151", fontWeight: 500,
                  textAlign: "left", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "#f0f9ff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "white"; }}
              >
                <span style={{ color: "#6b7280" }}>{actionIcons[a.icon]}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Context */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Active Data Context</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Revenue Data", value: `${dashboardData.yearlyData?.length || 0} years`, color: "#2563eb" },
              { label: "Markets", value: `${dashboardData.countryData?.length || 0} countries`, color: "#7c3aed" },
              { label: "Products", value: `${dashboardData.productData?.length || 0} types`, color: "#0891b2" },
              { label: "Customers", value: `${dashboardData.topCustomers?.length || 0} top accounts`, color: "#059669" },
              { label: "KSA Projects", value: `${dashboardData.ksaProjects?.length || 0} active`, color: "#d97706" },
              { label: "AI Insights", value: `${dashboardData.aiInsights?.length || 0} recommendations`, color: "#dc2626" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
                  <span style={{ fontSize: 12, color: "#374151" }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Formats */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Supported Uploads</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              { ext: "CSV", bg: "#dcfce7", color: "#16a34a" },
              { ext: "XLSX", bg: "#dbeafe", color: "#2563eb" },
              { ext: "JSON", bg: "#f3e8ff", color: "#7c3aed" },
              { ext: "PDF", bg: "#fee2e2", color: "#dc2626" },
              { ext: "PNG/JPG", bg: "#fef3c7", color: "#d97706" },
              { ext: "TXT", bg: "#f1f5f9", color: "#475569" },
            ].map((f, i) => (
              <span key={i} style={{
                padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                background: f.bg, color: f.color, letterSpacing: 0.3,
              }}>{f.ext}</span>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Tips</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Upload a CSV to replace or extend existing data",
              "Ask Flow to generate new insights after data changes",
              "Click 'Apply Changes' to update all dashboard charts",
              "Drag & drop files directly into the chat area",
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>
                <span style={{ color: "#d1d5db", flexShrink: 0 }}>&#8226;</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flowPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
