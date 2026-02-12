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
                {segment.slice(2, -2)}
              </strong>
            );
          }

          return (
            <span key={`seg-${lineIndex}-${segmentIndex}`}>
              {segment}
            </span>
          );
        })}
      </span>
    );
  });
};

