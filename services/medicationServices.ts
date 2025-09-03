import { MedicationType } from '@/db/types';

import db from '@/db/client';
import { medicationTable } from '@/db/schema';
import { eq } from 'drizzle-orm';


const medicationServices = {
  getAllMedications: async (): Promise<Array<MedicationType>> => {
    return new Promise(async (resolve, reject) => {
      try {
        const medications = await db.select().from(medicationTable)
        const parsedMedications = medications.map(medication => ({
          ...medication,

          alias: medication.alias ? medication.alias : '',
          instructions: medication.instructions ? medication.instructions : '',

          startDate: new Date(JSON.parse(medication.startDate)),
          takenAt: (JSON.parse(medication.takenAt) as Array<string>).map(takenAt => new Date(takenAt)),
        }))
        resolve(parsedMedications);
        
      } catch (e) {
        reject(e);
      }
    })
  },

  getMedicationById: async (id: number): Promise<MedicationType> => {
    return new Promise(async (resolve, reject) => {
      try {
        const medication = (await db.select().from(medicationTable)
        .where(eq(medicationTable.id, id))
        .limit(1))[0]

        if (medication) {
          const parsedMedication = {
            ...medication,
  
            alias: medication.alias ? medication.alias : '',
            instructions: medication.instructions ? medication.instructions : '',
  
            startDate: new Date(JSON.parse(medication.startDate)),
            takenAt: (JSON.parse(medication.takenAt) as Array<string>).map(takenAt => new Date(takenAt)),
          }
          resolve(parsedMedication);

        } else {
          reject();
        }
        
      } catch (e) {
        reject(e);
      }
    })
  },

  createMedication: async (medication: MedicationType): Promise<MedicationType> => {
    return new Promise(async (resolve, reject) => {
      try {
        const createdMedication = (await db.insert(medicationTable).values([
          {
            ...medication,

            startDate: JSON.stringify(medication.startDate),
            takenAt: JSON.stringify(medication.takenAt),
          }
        ]).returning())[0]

        resolve({
          ...medication,

          id: createdMedication.id
        });

      } catch (e) {
        reject(e);
      }
    })
  },

  updateMedication: async (medication: MedicationType): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (medication.id) {
          await db.update(medicationTable)
          .set({
            ...medication,

            startDate: JSON.stringify(medication.startDate),
            takenAt: JSON.stringify(medication.takenAt),
          })
          .where(eq(medicationTable.id, medication.id!))
  
          resolve();

        } else {
          reject();
        }

      } catch (e) {
        reject(e);
      }
    })
  },

  deleteMedication: async (medication: MedicationType): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.delete(medicationTable)
        .where(eq(medicationTable.id, medication.id!))

        resolve()

      } catch (e) {
        reject(e);
      }
    })
  },

}


export default medicationServices;