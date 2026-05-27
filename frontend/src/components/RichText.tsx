import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Lightweight markdown renderer for LLM responses (clues, headlines,
// feedback). Honors bold, italic, code, code fences with JSON, lists,
// blockquotes, tables (via remark-gfm). Styled to fit the app's
// trading-floor amber/ink palette.
//
// Plain text without any markdown markers renders as-is; the wrapper
// just becomes a styled paragraph container. No surprises for the
// common case.

interface RichTextProps {
  text: string;
  /** Optional inline override on the outermost wrapper. */
  style?: React.CSSProperties;
}

export default function RichText({ text, style }: RichTextProps) {
  return (
    <div className="rich-text" style={style}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // Pin renderers so headings, links, code don't inherit weird
        // browser defaults. Keep the list short — just what the LLM
        // actually emits.
        components={{
          p: ({ children }) => (
            <p style={{ margin: "0 0 8px", lineHeight: 1.55 }}>{children}</p>
          ),
          strong: ({ children }) => (
            <strong style={{ color: "var(--amber-bright)", fontWeight: 600 }}>
              {children}
            </strong>
          ),
          em: ({ children }) => <em style={{ fontStyle: "italic" }}>{children}</em>,
          code: ({ children, className, ...rest }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.92em",
                    background: "rgba(212,163,91,0.08)",
                    border: "1px solid var(--panel-edge)",
                    padding: "1px 5px",
                    color: "var(--amber-bright)",
                  }}
                  {...rest}
                >
                  {children}
                </code>
              );
            }
            // Fenced code block (e.g. ```json …```). Rendered as <code>
            // inside <pre>; we style the parent pre below.
            return (
              <code
                className={className}
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 12,
                  color: "var(--ink)",
                  display: "block",
                  whiteSpace: "pre",
                }}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre
              style={{
                background: "var(--bg-soft)",
                border: "1px solid var(--panel-edge)",
                borderLeft: "3px solid var(--bronze)",
                padding: "10px 12px",
                margin: "6px 0 10px",
                overflowX: "auto",
                whiteSpace: "pre",
              }}
            >
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul style={{ margin: "4px 0 8px 0", paddingLeft: 22 }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol style={{ margin: "4px 0 8px 0", paddingLeft: 22 }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li style={{ margin: "2px 0", lineHeight: 1.5 }}>{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              style={{
                borderLeft: "2px solid var(--amber)",
                padding: "2px 10px",
                margin: "4px 0 10px",
                color: "var(--ink-soft)",
                fontStyle: "italic",
              }}
            >
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--amber-bright)", textDecoration: "underline" }}
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <h3 className="serif" style={{ marginTop: 8 }}>{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="serif" style={{ marginTop: 8 }}>{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="serif" style={{ marginTop: 6 }}>{children}</h4>
          ),
          hr: () => <hr style={{ border: 0, borderTop: "1px solid var(--panel-edge)", margin: "10px 0" }} />,
          table: ({ children }) => (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, margin: "6px 0 10px" }}>
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--panel-edge)", color: "var(--ink-faint)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 10 }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--panel-edge)" }}>{children}</td>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
