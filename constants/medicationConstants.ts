export const availableDosageUnits = [
  {
    label: 'mg',
    code: 0,
  },
  {
    label: 'ml',
    code: 1,
  },
]

export const availableFrequencies = [
  {
    label: 'Three times a day',
    code: 3,
  },
  {
    label: 'Two times a day',
    code: 2,
  },
  {
    label: 'Once a day',
    code: -1,
  },
  ...Array.from(Array(14).keys())
  .map(i => i + 2)
  .map(i => ({
      label: `Once every ${i} days`,
      code: -i
  }))
]

export const scheduleShownDaysCount = 7;
