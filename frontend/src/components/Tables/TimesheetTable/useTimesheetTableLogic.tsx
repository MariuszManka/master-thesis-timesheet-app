import { useSnackbar } from 'notistack'
import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ITimesheetTableProps, IUseTimesheetTablesLogicProps, IUseTimesheetTablesLogicReturnProps } from './AllTimesheetTablesProps'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import timesheetService from 'services/TimesheetService/TimesheetService'
import { Autocomplete, AutocompleteChangeReason, Button, IconButton, TextField } from '@mui/material'
import { ColumnEditorOptions } from 'primereact/column'
import { AppState } from 'store'
import { Dialog } from 'primereact/dialog'


export const useTimesheetTableLogic = (props: IUseTimesheetTablesLogicProps): IUseTimesheetTablesLogicReturnProps => {
   const { appTimesheetActivityTypes } = useSelector((state: AppState) => state.applicationState)

   const [editedCell, setEditedCell] = useState<string | undefined>(undefined)
   const [timesheetToDeleteId, setTimesheetToDeleteId] = useState<number | undefined>(undefined);
   const [isDeleteTimesheetModalOpen, setIsDeleteTimesheetModalOpen] = useState<boolean>(false)
   const { setIsLoading, loadLazyData } = props;
   

   const editedRowsTemplate = (content: string, showIcon: boolean) => {
      return (
         <div style={{ display: 'inline-flex', alignItems: 'center', columnGap: 8, maxHeight: 100, overflowY: 'auto' }}>
            {showIcon ? <EditIcon style={{ width: 15, marginTop: -3, color: '#0D1F2B' }} /> : <span style={{width: 15}}></span> }
            <p>{content}</p>
         </div>
      )
   }

   
   const actionsBodyTemplate = (isActionAvailable: boolean, timesheetToDeleteId: number) => {
      if(isActionAvailable) {
         return (
            <div style={{ width: 80 }}>
               <IconButton style={{ color: '#732525' }} onClick={() => {setTimesheetToDeleteId(timesheetToDeleteId); setIsDeleteTimesheetModalOpen(true)}}>
                  <DeleteIcon />
               </IconButton>
            </div>
         )
      }
      else {
         return <div style={{ width: 80 }} />
      }
   }


   const dialogFooterContent = (
      <div style={{ display: 'inline-flex', columnGap: 20 }}>
         <Button onClick={() => handleOnDeleteSelectedRow()} autoFocus className='app-table-delete-modal-button agree-button'>Tak</Button>
         <Button onClick={() => setIsDeleteTimesheetModalOpen(false)} className='app-table-delete-modal-button disagree-button' >Nie</Button>
      </div>
   )


   const DeleteTimesheetEntryModal = () => (
      <Dialog
         header="Potwierdź akcję" visible={isDeleteTimesheetModalOpen} style={{ width: '35vw' }} draggable={false} resizable={false}
         onHide={() => setIsDeleteTimesheetModalOpen(false)} footer={dialogFooterContent}
      >
         Czy na pewno chcesz usunąć zaznaczony wpis o id {timesheetToDeleteId}?
      </Dialog>
   )  


      /**
    * onBlur na kontrolce pozwala na edycję komórki
    * @param fieldName 
    * @param timesheetId 
    * @param currentInputValue 
    */
   const onHandleCellEditComplete = async (fieldName: string, timesheetId: number, currentInputValue: string) => {
      setIsLoading(true)
      await timesheetService.updateSelectedTimesheet({ currentTimesheetId: timesheetId, updatedTimesheetData: { [fieldName]: currentInputValue } })
      await loadLazyData()
      setEditedCell(undefined)
      setIsLoading(false)
   }

      /**
    * Usuwanie wybranego wpisu
    * @param selectedTimesheetId 
    */
      const handleOnDeleteSelectedRow = useCallback(async() => {
         
         if(timesheetToDeleteId !== undefined){
            await timesheetService.deleteSelectedTimesheet(timesheetToDeleteId)
            await loadLazyData()
            setIsDeleteTimesheetModalOpen(false)
            setTimesheetToDeleteId(undefined)
         }
      }, [ timesheetToDeleteId ])
   

      const InlineCellEditor = (options: ColumnEditorOptions) => {
         if(options.rowData.isCurrentUserTimesheet === true){
            switch (options.field) {
               case 'taskDescription': {
                  if(options.node !== undefined && options.node.key.split('-').length === 1){
                     // Pozwalamy edytować tylko komórki, które są dziećmi, nadrzędne komórki dotyczą zadań a nie wpisów, stąd zabraniamy edycji
                     return editedRowsTemplate(options.value, false) 
                  }
            
                  return (
                     <TextField
                        value={editedCell} 
                        onFocus={() => setEditedCell(options.value)} 
                        onChange={(e) => setEditedCell(e.target.value)} 
                        onBlur={(e) => editedCell !== options.value && onHandleCellEditComplete(options.field, options.rowData.id, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        classes={{ root: 'timesheet-table-inline-editor' }}
                     />
                  )
               }
               case 'timeSpentInHours': {
                  if(options.node !== undefined && options.node.key.split('-').length === 1){
                     // Pozwalamy edytować tylko komórki, które są dziećmi, nadrzędne komórki dotyczą zadań a nie wpisów, stąd zabraniamy edycji
                     return editedRowsTemplate(`${parseFloat(options.value).toFixed(2)} h`, false)
                  }
            
                  const maxInputValue = 12
                  const minInputValue = 0.10
      
                  const handleOnInputNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                     const val = e.target.value
                     setEditedCell(val)
                  }
      
                  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
                     if(editedCell !== options.value){
                        let newParsedValue = parseFloat(e.target.value || '0')
         
                        if(newParsedValue > maxInputValue){
                           newParsedValue = maxInputValue
                        }
         
                        if(newParsedValue < minInputValue){
                           newParsedValue = minInputValue
                        }
         
         
                        await onHandleCellEditComplete(options.field, options.rowData.id, newParsedValue.toString())
                     }
                  }
      
                  return (
                     <TextField
                        type='number'
                        slotProps={{ htmlInput : { inputMode: 'decimal', min: minInputValue.toFixed(2), max: maxInputValue.toFixed(2), step: 0.10 } }}
                        value={editedCell}
                        onChange={handleOnInputNumberChange}
                        onBlur={handleBlur}
                        onFocus={() => setEditedCell(options.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        classes={{ root: 'timesheet-table-inline-editor' }}
                     />
                  )
               }
      
               case 'activityType': {
                  if(options.node !== undefined && options.node.key.split('-').length === 1){
                     // Pozwalamy edytować tylko komórki, które są dziećmi, nadrzędne komórki dotyczą zadań a nie wpisów, stąd zabraniamy edycji
                     return editedRowsTemplate(options.value, false)
                  }
      
                  const onInputAutocompleteChange = async(e: React.ChangeEvent<{}>, newValue: string | null, reason: AutocompleteChangeReason) => {
                     if(reason === 'selectOption' || reason === 'clear') {
                        await onHandleCellEditComplete(options.field, options.rowData.id, newValue ?? '')
                        setEditedCell(newValue ?? '')
                     }
                  }
      
                  return (
                     <Autocomplete
                        sx={{ minWidth: 150 }}
                        value={editedCell}
                        onOpen={() => setEditedCell(options.value)}
                        onChange={onInputAutocompleteChange}
                        disableClearable
                        openOnFocus	
                        handleHomeEndKeys
                        options={appTimesheetActivityTypes}
                        renderInput={(params) => (<TextField {...params} />)}
                        classes={{ root: 'timesheet-table-inline-editor' }}
                     />
                  )
               }
            }
         }
         else {
            return editedRowsTemplate(options.value, false) 
         }
      }


      return {
         editedRowsTemplate,
         actionsBodyTemplate,
         onHandleCellEditComplete,
         DeleteTimesheetEntryModal,
         InlineCellEditor,
      }
}
