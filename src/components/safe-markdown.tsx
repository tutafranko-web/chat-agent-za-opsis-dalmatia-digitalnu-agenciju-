import { Fragment, type ReactNode } from "react";

/**
 * Minimal, safe Markdown for chat replies: paragraphs, "- " bullet lists,
 * **bold**, *italic* and [links](…). Only same-site paths and https URLs
 * become links; everything else is rendered as plain text (no HTML).
 */
function safeHref(href: string): string | null {
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const u = new URL(href);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|\*[^*\s][^*]*\*|https:\/\/[^\s)]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("[")) {
      const mm = tok.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      const href = mm ? safeHref(mm[2]) : null;
      if (mm && href) {
        const external = href.startsWith("http");
        out.push(
          <a key={key} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>
            {mm[1]}
          </a>,
        );
      } else out.push(mm ? mm[1] : tok);
    } else if (tok.startsWith("https://")) {
      const trimmed = tok.replace(/[.,;:!?]+$/, "");
      const href = safeHref(trimmed);
      out.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow">
            {trimmed}
          </a>
        ) : (
          trimmed
        ),
      );
      if (trimmed.length < tok.length) out.push(tok.slice(trimmed.length));
    } else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function SafeMarkdown({ text }: { text: string }) {
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className="prose-chat">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim() !== "");
        const isList = lines.length > 0 && lines.every((l) => /^\s*([-*•]|\d+\.)\s+/.test(l));
        if (isList) {
          return (
            <ul key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*([-*•]|\d+\.)\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l.replace(/^#+\s*/, ""), `${bi}-${li}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
