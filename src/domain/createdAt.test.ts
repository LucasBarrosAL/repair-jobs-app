import { formatCreatedAt } from '@/domain/createdAt'

it('formats midnight UTC as a calendar date', () => {
  expect(formatCreatedAt('2024-01-08T00:00:00.000Z')).toBe('Jan 8, 2024, 12:00 AM')
})

it('formats an evening UTC time', () => {
  expect(formatCreatedAt('2026-10-07T18:00:00.000Z')).toBe('Oct 7, 2026, 6:00 PM')
})
