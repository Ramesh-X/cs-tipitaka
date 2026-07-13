export function asHref(value: string): string {
  const normalizedPath = value.replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '');

  return normalizedPath.length > 0 ? `/${normalizedPath}` : '/';
}

export function urlMerge(url1: string, url2: string): string {
  const left = url1.replace(/\/+$/g, '');
  const right = url2.replace(/^\/+/, '');

  return `${left}/${right}`;
}
