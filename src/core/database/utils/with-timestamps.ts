import { timestamp } from 'drizzle-orm/pg-core'

export const withTimestamps = {
  created: timestamp({ withTimezone: true, precision: 3 })
    .defaultNow()
    .notNull(),
  updated: timestamp({ withTimezone: true, precision: 3 })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deleted: timestamp({ withTimezone: true, precision: 3 }),
}
