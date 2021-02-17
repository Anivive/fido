export function fileName(path: string): string {
  const slash = path.lastIndexOf('/') + 1;
  const period = path.lastIndexOf('.');
  return path.substring(slash, period);
}

export function guid() {
  return (Date.now() + Math.round(Math.random() * 99999)).toString();
}
