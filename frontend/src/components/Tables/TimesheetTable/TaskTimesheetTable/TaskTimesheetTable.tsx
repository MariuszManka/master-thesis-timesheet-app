import { AppLinks } from 'common/AppLinks'
import { useSnackbar } from 'notistack'
import { Column, ColumnEditorOptions } from 'primereact/column'
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import timesheetService, { ITimesheetInTaskModel } from 'services/TimesheetService/TimesheetService'
import { AppState } from 'store'
import { setCurrentTimesheetTableSettings, setTaskTimesheet } from 'store/TimesheetSlice/TimesheetSlice'

import { DataTable } from 'primereact/datatable'
import { useTimesheetTableLogic } from '../useTimesheetTableLogic'

import '../AllTimesheetTablesStyles.scss'



const TaskTimesheetTable = (props: { currentSelectedTaskId: number }) => {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { enqueueSnackbar } = useSnackbar()
   
   
   const currentTaskTimesheet = useSelector((state: AppState) => state.timesheetState.currentTaskTimesheet)
   const currentTableSettings = useSelector((state: AppState) => state.timesheetState.currentTimesheetTableSettings)
   
   const [isLoading, setIsLoading] = useState<boolean>(false)
   const [totalRecords, setTotalRecords] = useState(0)
   const [lazyParams, setLazyParams] = useState({ first: currentTableSettings.offset, rows: currentTableSettings.limit, filter: '' })


   useEffect(() => {
      loadLazyData()
   }, [ lazyParams ])


   const loadLazyData = useCallback(async () => {
      try {
         setIsLoading(true)
         
         const taskTimesheetResponse = await timesheetService.getTaskTimesheets(props.currentSelectedTaskId, lazyParams.first, lazyParams.rows)
            
         dispatch(setTaskTimesheet(taskTimesheetResponse.timesheets))
         setTotalRecords(taskTimesheetResponse.total)
      } 
      catch (error) {
         enqueueSnackbar("Nie udało się odczytać listy zadań.", { variant: "error", autoHideDuration: 5000, preventDuplicate: true })
         navigate(AppLinks.home)
      } 
      finally {
         setIsLoading(false)
      }
   }, [ lazyParams ])


   //=================================================  IMPORTANT - UŻYCIE HOOKA useTimesheetTableLogic ================================================= 
   const { 
      editedRowsTemplate, 
      actionsBodyTemplate,
      InlineCellEditor,
      DeleteTimesheetEntryModal, 
    } = useTimesheetTableLogic({ setIsLoading, loadLazyData: loadLazyData })
   // ===================================================================================================================================================


   const onPageChange = useCallback((event: any) => {
      dispatch(setCurrentTimesheetTableSettings({ limit: event.rows as number, offset: event.first }))
      setLazyParams(event)
   }, [ dispatch ])


   return (
      <>
         <DataTable 
            className='app-table-outer-wrapper'
            paginator lazy loading={isLoading}
            value={currentTaskTimesheet} 
            style={{ maxWidth: 'calc(90vw - 300px)' }} scrollable
            emptyMessage="Brak zadań"  
            selectionMode="single" editMode="cell"
            rows={lazyParams.rows} totalRecords={totalRecords} first={lazyParams.first} 
            onPage={onPageChange}
         >
            <Column field="id" header="Id" style={{ minWidth: 80, textAlign: 'left',  }} />
            <Column field="activityDate" header="Data" style={{ textAlign: 'left', minWidth: 150 }} />
            <Column field="creatorFullName" header="Autor" style={{  textAlign: 'left', overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',  minWidth: 200 }} />
            <Column field="taskDescription" header="Opis zagadnienia" style={{ minWidth: 450 }} 
               editor={(options: ColumnEditorOptions) => InlineCellEditor(options, true)} 
               body={(rowData: ITimesheetInTaskModel) => editedRowsTemplate(rowData.taskDescription, true)}
            />
            <Column field="activityType" header="Typ zagadnienia" style={{ textAlign: 'left', minWidth: 200 }} 
               editor={(options: ColumnEditorOptions) => InlineCellEditor(options, true)} 
               body={(rowData: ITimesheetInTaskModel) => editedRowsTemplate(rowData.activityType, true)} 
            />
            <Column field="timeSpentInHours" header="Przepracowany czas" style={{ minWidth: 200 }}
               editor={(options: ColumnEditorOptions) => InlineCellEditor(options, true)} 
               body={(rowData: ITimesheetInTaskModel) => editedRowsTemplate(`${parseFloat(rowData.timeSpentInHours).toFixed(2)} h `, true)}
            />
            <Column style={{ width: '50px' }}
               body={(rowData: ITimesheetInTaskModel) => actionsBodyTemplate((rowData.isCurrentUserTimesheet), rowData.id )}
            />
         </DataTable>
         <DeleteTimesheetEntryModal />
      </>
   )
}

export default TaskTimesheetTable