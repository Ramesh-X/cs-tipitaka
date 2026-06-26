/**
 * Renders a schema.org JSON-LD block. Server-rendered so crawlers and AI
 * agents (which don't run JS) can read the structured data.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inject here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
