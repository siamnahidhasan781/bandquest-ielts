"use client";

/** Minimal safe markdown renderer (no external deps). */
export function Markdown({ text }: { text: string }) {
  const html = renderMarkdown(text);
  return <div className="lesson-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(s: string): string {
  let out = esc(s);
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*(.+?)\*/g, "<em>$1</em>");
  out = out.replace(/`(.+?)`/g, "<code>$1</code>");
  out = out.replace(/❌/g, "❌").replace(/✅/g, "✅");
  return out;
}

function renderMarkdown(src: string): string {
  const lines = src.split("\n");
  let html = "";
  let inTable = false;
  let inList: string | null = null;

  const closeList = () => {
    if (inList) {
      html += inList === "ul" ? "</ul>" : "</ol>";
      inList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table
    if (trimmed.startsWith("|")) {
      const cells = trimmed.split("|").slice(1, -1).map((c) => inline(c.trim()));
      if (!inTable) {
        html += "<table><thead><tr>" + cells.map((c) => `<th>${c}</th>`).join("") + "</tr></thead><tbody>";
        inTable = true;
        // skip separator row
        if (i + 1 < lines.length && /^\|[\s:\-|]+\|$/.test(lines[i + 1].trim())) i++;
      } else {
        html += "<tr>" + cells.map((c) => `<td>${c}</td>`).join("") + "</tr>";
      }
      continue;
    } else if (inTable) {
      html += "</tbody></table>";
      inTable = false;
    }

    if (trimmed.startsWith("### ")) {
      closeList();
      html += `<h3>${inline(trimmed.slice(4))}</h3>`;
    } else if (trimmed.startsWith("## ")) {
      closeList();
      html += `<h2>${inline(trimmed.slice(3))}</h2>`;
    } else if (/^>\s?/.test(trimmed)) {
      closeList();
      html += `<blockquote>${inline(trimmed.replace(/^>\s?/, ""))}</blockquote>`;
    } else if (/^[-*]\s+/.test(trimmed)) {
      if (inList !== "ul") {
        closeList();
        html += "<ul>";
        inList = "ul";
      }
      html += `<li>${inline(trimmed.replace(/^[-*]\s+/, ""))}</li>`;
    } else if (/^\d+\.\s+/.test(trimmed)) {
      if (inList !== "ol") {
        closeList();
        html += "<ol>";
        inList = "ol";
      }
      html += `<li>${inline(trimmed.replace(/^\d+\.\s+/, ""))}</li>`;
    } else if (trimmed === "") {
      closeList();
    } else {
      closeList();
      html += `<p>${inline(trimmed)}</p>`;
    }
  }
  closeList();
  if (inTable) html += "</tbody></table>";
  return html;
}
