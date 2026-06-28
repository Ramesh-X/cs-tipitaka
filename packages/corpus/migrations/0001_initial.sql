-- nodes: the full corpus tree stored flat with adjacency-list hierarchy
CREATE TABLE IF NOT EXISTS nodes (
  slug        TEXT    PRIMARY KEY,
  parent_slug TEXT    REFERENCES nodes(slug),
  position    INTEGER NOT NULL DEFAULT 0,
  type        TEXT    NOT NULL CHECK(type IN ('pitaka','nikaya','collection','document')),
  pali        TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_nodes_parent ON nodes(parent_slug);

-- paragraphs: body text for document-type nodes
CREATE TABLE IF NOT EXISTS paragraphs (
  document_slug TEXT    NOT NULL REFERENCES nodes(slug),
  position      INTEGER NOT NULL,
  rend          TEXT,
  num           TEXT,
  pts           TEXT,
  cst           TEXT,
  pali          TEXT    NOT NULL,
  PRIMARY KEY (document_slug, position)
);

CREATE INDEX IF NOT EXISTS idx_paragraphs_document ON paragraphs(document_slug);

-- translations: per-paragraph translated text keyed by language code
CREATE TABLE IF NOT EXISTS translations (
  document_slug  TEXT NOT NULL,
  para_position  INTEGER NOT NULL,
  lang           TEXT NOT NULL,
  text           TEXT NOT NULL,
  PRIMARY KEY (document_slug, para_position, lang),
  FOREIGN KEY (document_slug, para_position) REFERENCES paragraphs(document_slug, position)
);

