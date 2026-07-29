export function isDocument(node: { type: string }): boolean {
  return node.type === 'document';
}
