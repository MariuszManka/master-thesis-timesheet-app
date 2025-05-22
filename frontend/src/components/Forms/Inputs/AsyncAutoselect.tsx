import { useEffect, useState } from 'react';
import { Autocomplete, CircularProgress, AutocompleteProps } from '@mui/material';

type AsyncAutocompleteProps = {
   fetchOptions: () => Promise<any[]>;
   value: any;
   onChange: (event: any, value: any) => void;
   renderInput: (params: any) => React.ReactNode;
   [key: string]: any;
 };

 export const AsyncAutocomplete = ({ fetchOptions, value, onChange, renderInput, ...props }: AsyncAutocompleteProps) => {

   const [options, setOptions] = useState<any[]>([])
   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)


   const fetchData = async () => {
      setLoading(true)
      try {
        const data = await fetchOptions()
        setOptions(data)
      } 
      catch (err) {
        console.error("Błąd ładowania opcji:", err)
      } 
      finally {
        setLoading(false)
      }
   }


   useEffect(() => {
      if (open) {
         fetchData()
      }
   }, [open])

  return (
      <Autocomplete
         open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}
         value={value} onChange={onChange} options={options} loading={loading}
         {...props}
         renderInput={(params: any) =>
         renderInput({
            ...params,
            InputProps: {
               ...params.InputProps,
               endAdornment: (
               <>
                  {loading && <CircularProgress size={20} color="inherit" />}
                  {params.InputProps.endAdornment}
               </>
               ),
            },
         })
         }
      />
  )
}



export default AsyncAutocomplete