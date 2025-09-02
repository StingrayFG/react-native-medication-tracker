import { type InferSelectModel } from 'drizzle-orm';

import { medicationHistoryTable, medicationTable } from './schema';

export type MedicationTableType = InferSelectModel<typeof medicationTable>;

export type MedicationType = {
  id?: number,

  name: string,
  alias: string
  instructions: string,

  dosage: number,
  dosageUnit: string,

  startDate: Date
  frequency: number,
  takenAt: Array<Date>,
}

export type MedicationHistoryTableType = InferSelectModel<typeof medicationHistoryTable>;

export type MedicationHistoryType = {
  id?: number,

  medicationId: number,

  beenTakenAt: Date,
}

export type ScheduleMedicationType = Omit<MedicationType, 'takenAt'> & { 
  hasBeenTaken?: boolean, 
  takenAt: Date,
}

export type ScheduleDayType = { 
  date: Date, 
  medications: Array<ScheduleMedicationType>
}