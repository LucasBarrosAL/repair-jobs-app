export function createLocalId(): string {
  return `local_${new Date().getTime()}`;
}
