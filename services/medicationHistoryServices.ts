
import db from '@/db/client';
import { medicationHistoryTable } from '@/db/schema';
import { MedicationHistoryType, ScheduleMedicationType } from '@/db/types';
import { and, eq } from 'drizzle-orm';


const medicationHistoryServices = {

  getAllHistoryRecordsByMedicationId: async (id: number): Promise<Array<MedicationHistoryType>> => {
    return new Promise(async (resolve, reject) => {
      try {
        const medicationHistory = (await db.select().from(medicationHistoryTable)
        .where(eq(medicationHistoryTable.medicationId, id)))
        .sort((a, b) => a < b ? 1 : -1);

        if (medicationHistory) {
          const parsedMedicationHistory = medicationHistory.map(medicationHistory => ({
            ...medicationHistory,
            beenTakenAt: new Date(JSON.parse(medicationHistory.beenTakenAt)),
          }))
          resolve(parsedMedicationHistory)
          
        } else {
          reject()
        }
        
      } catch (e) {
        reject(e);
      }
    })
  },

  getLatestHistoryRecordsByMedicationId: async (id: number, count: number = 1): Promise<Array<MedicationHistoryType>> => {
    return new Promise(async (resolve, reject) => {
      try {
        const medicationHistory = (await db.select().from(medicationHistoryTable)
        .where(eq(medicationHistoryTable.medicationId, id)))
        .sort((a, b) => a < b ? 1 : -1);

        if (medicationHistory) {
          const parsedMedicationHistory = medicationHistory.map(medicationHistory => ({
            ...medicationHistory,
            beenTakenAt: new Date(JSON.parse(medicationHistory.beenTakenAt)),
          }));

          if (parsedMedicationHistory.length === 0) {
            reject();
          } else if (parsedMedicationHistory.length >= count) {
            resolve(parsedMedicationHistory.slice(0, count));
          } else {
            resolve(parsedMedicationHistory.concat(
              Array(count - parsedMedicationHistory.length).fill(undefined)
            ));
          }
          
        } else {
          reject();
        }
        
      } catch (e) {
        reject(e);
      }
    })
  },

  createHistoryRecord: async (medication: ScheduleMedicationType): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.insert(medicationHistoryTable).values([
          {
            medicationId: medication.id!,
            beenTakenAt: JSON.stringify(medication.takenAt),
          }
        ])
        resolve();

      } catch (e) {
        reject(e);
      }
    })
  },

  deleteHistoryRecord: async (medication: ScheduleMedicationType): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.delete(medicationHistoryTable)
        .where(and(
          eq(medicationHistoryTable.beenTakenAt, JSON.stringify(medication.takenAt)),
          eq(medicationHistoryTable.medicationId, medication.id!),
        ))

        resolve();

      } catch (e) {
        reject(e);
      }
    })
  },

}


export default medicationHistoryServices;