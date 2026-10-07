const createdAtFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatCreatedAt(createdAt: string): string {
  return createdAtFormat.format(new Date(createdAt)).replaceAll('\u202f', ' ')
}
