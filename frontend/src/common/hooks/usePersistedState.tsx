import { useEffect, useState } from 'react'

export default function usePersistedState<T>(key: string, initialValue: T) {
   const [value, setValue] = useState(() => {
      const item = localStorage.getItem(key)

      if(!item){
         return initialValue;
      }

      return JSON.parse(item) as T
   })

   useEffect(() => {
      localStorage.setItem(key, JSON.stringify(value))
   }, [key, value])

   return [value, setValue] as const
}