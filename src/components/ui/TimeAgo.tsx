import { timeAgo, formatDateTime } from "@/lib/utils";

interface Props {
  date: string | Date;
  /** Wrapper className */
  className?: string;
  /** Show only the relative text; tooltip has the absolute one */
  short?: boolean;
}

/**
 * Renders a relative time ("acum 3 ore") with a native `title` tooltip
 * containing the absolute timestamp. Screen readers get both via the
 * semantic <time> element's datetime attribute. Drop-in replacement for
 * `{timeAgo(x)}` — adds hover context at zero visual cost.
 */
export function TimeAgo({ date, className, short }: Props) {
  const iso = typeof date === "string" ? date : date.toISOString();
  const rel = timeAgo(date);
  const abs = formatDateTime(date);
  return (
    <time
      dateTime={iso}
      title={abs}
      className={className}
      aria-label={`${rel} (${abs})`}
    >
      {short ? rel : rel}
    </time>
  );
}
