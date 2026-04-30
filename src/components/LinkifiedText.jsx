const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/g;

function shortenUrl(url, maxLen = 50) {
  try {
    const { hostname, pathname } = new URL(url);
    const short = hostname + pathname;
    return short.length > maxLen ? short.slice(0, maxLen) + "…" : short;
  } catch {
    return url.length > maxLen ? url.slice(0, maxLen) + "…" : url;
  }
}

export function LinkifiedText({ text, style, shorten = true }) {
  if (!text) return null;

  const parts = [];
  let lastIndex = 0;
  let match;

  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text)) !== null) {
    const [url] = match;
    const { index } = match;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <a
        key={index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "var(--navy, #1a3a5c)",
          textDecoration: "underline",
          wordBreak: "break-all",
        }}
      >
        {shorten ? shortenUrl(url) : url}
      </a>
    );

    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span style={style}>{parts}</span>;
}