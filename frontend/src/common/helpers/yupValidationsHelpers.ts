import { Environment } from 'environment/AppSettings'
import { DateTime, Interval } from 'luxon'

export const isDateValid = {
   name: 'isDateValid',
   message: 'Nieprawidłowa data',
   test: (dateToCheck: string | undefined | null) => {
      if(!dateToCheck) {
         return true
      }
      else {
         const interval = Interval.fromDateTimes(DateTime.local(2000, 1, 1), DateTime.local(2300, 12, 31));
         const dateTimeObject = DateTime.fromFormat(dateToCheck, Environment.dateFormatToDisplay)

         return Boolean(dateTimeObject.isValid && interval.contains(dateTimeObject))
      }
   }
}