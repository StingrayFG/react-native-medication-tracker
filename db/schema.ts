import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const medicationTable = sqliteTable('medication_table', {
  id: int().primaryKey({ autoIncrement: true }),

  name: text().notNull(),
  alias: text(),
  instructions: text(),

  dosage: int().notNull(),
  dosageUnit: text().notNull(),

  startDate: text().notNull(), // stringified date
  frequency: int().notNull(),
  takenAt: text().notNull(), // stringified array of dates
});

export const medicationHistoryTable = sqliteTable('medication_history_table', {
  id: int().primaryKey({ autoIncrement: true }),

  medicationId: int().notNull(),

  beenTakenAt: text().notNull(),
});