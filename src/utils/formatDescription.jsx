const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const rawUrlRegex = /(https?:\/\/[^\s]+)/g;

const renderLinksFromText = (text, keyPrefix) => {
  const pieces = text.split(rawUrlRegex);
  return pieces.map((piece, index) => {
    if (rawUrlRegex.test(piece)) {
      rawUrlRegex.lastIndex = 0;
      return (
        <a
          key={`${keyPrefix}-raw-link-${index}`}
          href={piece}
          target="_blank"
          rel="noreferrer"
          className="text-blue-700 underline underline-offset-2 hover:text-blue-800"
        >
          {piece}
        </a>
      );
    }
    rawUrlRegex.lastIndex = 0;
    return <span key={`${keyPrefix}-raw-text-${index}`}>{piece}</span>;
  });
};

const renderSegmentWithLinks = (segment, keyPrefix) => {
  const output = [];
  let lastIndex = 0;
  let match;

  while ((match = markdownLinkRegex.exec(segment)) !== null) {
    const [fullMatch, label, href] = match;
    const startIndex = match.index;

    if (startIndex > lastIndex) {
      output.push(...renderLinksFromText(segment.slice(lastIndex, startIndex), `${keyPrefix}-before-${startIndex}`));
    }

    output.push(
      <a
        key={`${keyPrefix}-md-link-${startIndex}`}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-blue-700 underline underline-offset-2 hover:text-blue-800"
      >
        {label}
      </a>
    );

    lastIndex = startIndex + fullMatch.length;
  }

  if (lastIndex < segment.length) {
    output.push(...renderLinksFromText(segment.slice(lastIndex), `${keyPrefix}-after`));
  }

  markdownLinkRegex.lastIndex = 0;
  return output.length ? output : [<span key={`${keyPrefix}-plain`}>{segment}</span>];
};

export const renderFormattedDescription = (value) => {
  const text = String(value || "");
  const lines = text.split(/\r?\n/);

  return lines.map((line, lineIndex) => {
    const segments = line.split(/(\*\*[^*]+\*\*)/g);

    return (
      <span key={`line-${lineIndex}`} className="block">
        {segments.map((segment, segmentIndex) => {
          const isBold =
            segment.startsWith("**") &&
            segment.endsWith("**") &&
            segment.length > 4;

          if (isBold) {
            return (
              <strong key={`seg-${lineIndex}-${segmentIndex}`} className="font-semibold text-slate-800">
                {renderSegmentWithLinks(segment.slice(2, -2), `bold-${lineIndex}-${segmentIndex}`)}
              </strong>
            );
          }

          return (
            <span key={`seg-${lineIndex}-${segmentIndex}`}>
              {renderSegmentWithLinks(segment, `text-${lineIndex}-${segmentIndex}`)}
            </span>
          );
        })}
      </span>
    );
  });
};
