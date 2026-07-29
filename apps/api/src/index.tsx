import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  getTranslations,
  getNodeBySlug,
  getChildNodes,
  getParagraphs,
} from '@cs-tipitaka/corpus';
import { LANG_CODES, isDocument } from '@cs-tipitaka/shared';

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Read-only, public-domain (CC0) data — no auth, no credentials — so a
// slightly broader allowlist than just the production origin costs little.
// *.workers.dev covers the M8.1 staging deploy without hardcoding an
// account-specific subdomain; localhost:4321 is Astro's dev server default.
const ALLOWED_ORIGINS: (string | RegExp)[] = [
  'https://tipitakaonline.org',
  // <worker-name>.<account-subdomain>.workers.dev — two labels, not one.
  /^https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev$/,
  'http://localhost:4321',
];

app.use(
  '*',
  cors({
    origin: (origin) =>
      ALLOWED_ORIGINS.some((allowed) =>
        typeof allowed === 'string' ? allowed === origin : allowed.test(origin),
      )
        ? origin
        : undefined,
  }),
);

// GET /translations/<document-slug>?lang=<lang-code>
// The slug may contain slashes (e.g. vinaya/parajikapali), so the route uses a wildcard.
app.get('/translations/*', async (c) => {
  const slug = c.req.path.replace('/translations/', '');
  const lang = c.req.query('lang') ?? '';

  if (!slug) return c.json({ error: 'slug required' }, 400);
  if (!(LANG_CODES as readonly string[]).includes(lang)) {
    return c.json(
      { error: `lang must be one of: ${LANG_CODES.join(', ')}` },
      400,
    );
  }

  const translations = await getTranslations(c.env.CORPUS_DB, slug, lang);
  return c.json({ translations });
});

// GET /<slug> — corpus lookup by full path.
// Returns { nodes } for a container node (pitaka/nikaya/collection) or
// { document } for a document node. Rows are raw DB rows: `slug` here is the
// FULL path (unlike the web reader's tree-shaped CorpusNode.slug, which is
// only the leaf segment), and only `pali` is available — no title/blurb
// (those are sourced from CorpusNode.meta via getNodeMetas).
// Registered last: a root wildcard must not shadow /translations/*.
app.get('/*', async (c) => {
  const slug = c.req.path.slice(1);
  if (!slug) return c.json({ error: 'slug required' }, 400);

  const node = await getNodeBySlug(c.env.CORPUS_DB, slug);
  if (!node) return c.json({ error: 'not found' }, 404);

  return isDocument(node)
    ? c.json({ document: await getParagraphs(c.env.CORPUS_DB, slug) })
    : c.json({ nodes: await getChildNodes(c.env.CORPUS_DB, slug) });
});

export default app;
