import { AppLinks } from 'common/AppLinks'
import { useSnackbar } from 'notistack'
import { Column, ColumnEditorOptions  } from 'primereact/column'
import { TreeTable } from 'primereact/treetable'
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import timesheetService from 'services/TimesheetService/TimesheetService'
import { AppState } from 'store'
import { ISingleTimesheetTableEntry, setAllTimesheets, setCurrentTimesheetTableSettings } from 'store/TimesheetSlice/TimesheetSlice'
import PersonIcon from '@mui/icons-material/Person';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { Button } from '@mui/material'
import { Environment } from 'environment/AppSettings'
import { ITimesheetTableProps } from '../AllTimesheetTablesProps'
import { CURRENT_TIMESHEET_MODE } from 'pages/TimesheetPage/TimesheetPage'
import { useTimesheetTableLogic } from '../useTimesheetTableLogic'


import '../AllTimesheetTablesStyles.scss'


const TimesheetTable = (props: ITimesheetTableProps) => {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { enqueueSnackbar } = useSnackbar()
   const { currentTimesheetMode, isLoading, setCurrentTimesheetMode, setIsLoading } = props
   

   const allTimesheets = useSelector((state: AppState) => state.timesheetState.allUserTimesheets)
   const currentTableSettings = useSelector((state: AppState) => state.timesheetState.currentTimesheetTableSettings)
   const [totalRecords, setTotalRecords] = useState(0)
   const [lazyParams, setLazyParams] = useState({ first: currentTableSettings.offset, rows: currentTableSettings.limit, filter: '' })


   useEffect(() => {
      loadLazyData()
   }, [ lazyParams ])


   const isParentRow = useCallback((rowKey: string) => {
      return rowKey.split('-').length === 1
   }, [])


   const loadLazyData = useCallback(async () => {
      try {
         setIsLoading(true)
         const response = currentTimesheetMode === CURRENT_TIMESHEET_MODE.USER ? 
            await timesheetService.getCurrentUserTimesheets(lazyParams.first, lazyParams.rows, lazyParams.filter) :
            await timesheetService.getCurrentTeamTimesheets(lazyParams.first, lazyParams.rows, lazyParams.filter)


         dispatch(setAllTimesheets(response.tree))
         setTotalRecords(response.total)
      } 
      catch (error) {
         enqueueSnackbar("Nie udało się odczytać listy zadań.", { variant: "error", autoHideDuration: 5000, preventDuplicate: true })
         navigate(AppLinks.home)
      } 
      finally {
         setIsLoading(false)
      }
   }, [ lazyParams, currentTimesheetMode ])

   
   const onPageChange = useCallback((event: any) => {
      dispatch(setCurrentTimesheetTableSettings({ limit: event.rows as number, offset: event.first }))
      setLazyParams(event)
   }, [ dispatch ])


   //=================================================  IMPORTANT - UŻYCIE HOOKA useTimesheetTableLogic ================================================= 
   const { 
      editedRowsTemplate,  actionsBodyTemplate,
      DeleteTimesheetEntryModal, InlineCellEditor,
   } = useTimesheetTableLogic({setIsLoading, loadLazyData: loadLazyData})
   // ===================================================================================================================================================



   return (
      <>
         <div className="timesheet-table-change-view-buttons-wrapper">
            <Button
               startIcon={<PersonIcon style={{ marginTop: -2 }}/>}
               id="view-user-timesheet-button" className={currentTimesheetMode === CURRENT_TIMESHEET_MODE.USER ? 'timesheet-table-change-view-current-active-button' : ''}
               onClick={async(e: React.MouseEvent) => {
                  setCurrentTimesheetMode(CURRENT_TIMESHEET_MODE.USER)
                  setLazyParams({ first: 0, rows: Environment.defaultRowsPerTablePage, filter: lazyParams.filter })
                  loadLazyData()
               }}
            >
               Użytkownik
            </Button>
            <Button
               endIcon={<PeopleAltIcon />}
               id="view-team-timesheet-button" className={currentTimesheetMode === CURRENT_TIMESHEET_MODE.TEAM ? 'timesheet-table-change-view-current-active-button' : ''}
               onClick={async(e: React.MouseEvent) => {
                  setCurrentTimesheetMode(CURRENT_TIMESHEET_MODE.TEAM)
                  setLazyParams({ first: 0, rows: Environment.defaultRowsPerTablePage, filter: lazyParams.filter })
                  loadLazyData()
               }}
            >
               Zespół
            </Button>
         </div>
         <TreeTable 
            className='app-table-outer-wrapper'
            paginator lazy scrollable loading={isLoading} onPage={onPageChange} 
            value={allTimesheets} 
            emptyMessage="Brak zadań"  selectionMode="single" 
            rows={lazyParams.rows} totalRecords={totalRecords} first={lazyParams.first} 
         >
            <Column expander field="id" header="Id" style={{ width: 100, textAlign: 'left',  }} />
            <Column field="activityDate" header="Data" style={{ textAlign: 'left', width: '180px' }} />
            <Column field="creatorFullName" header="Autor" style={{  textAlign: 'left', overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',  width: '250px' }} />
            <Column field="taskDescription" header="Opis zagadnienia" style={{ width: '450px' }}
               editor={(options: ColumnEditorOptions) => InlineCellEditor(options, false)} 
               body={(rowData: ISingleTimesheetTableEntry) => editedRowsTemplate(rowData.data.taskDescription, (!isParentRow(rowData.key) && rowData.data.isCurrentUserTimesheet))}
            />
            <Column field="activityType" header="Typ zagadnienia" style={{ textAlign: 'left', width: '200px'}}
               editor={(options: ColumnEditorOptions) => InlineCellEditor(options, false)} 
               body={(rowData: ISingleTimesheetTableEntry) => editedRowsTemplate(rowData.data.activityType, (!isParentRow(rowData.key) && rowData.data.isCurrentUserTimesheet))} 
            />
            <Column field="timeSpentInHours" header="Przepracowany czas" style={{ width: '250px' }}
               editor={(options: ColumnEditorOptions) => InlineCellEditor(options, false)} 
               body={(rowData: ISingleTimesheetTableEntry) => editedRowsTemplate(`${parseFloat(rowData.data.timeSpentInHours).toFixed(2)} h `, (!isParentRow(rowData.key) && rowData.data.isCurrentUserTimesheet))}
            />
            <Column style={{ width: '50px' }}
               body={(rowData: ISingleTimesheetTableEntry) => actionsBodyTemplate((!isParentRow(rowData.key) && rowData.data.isCurrentUserTimesheet), rowData.data.id as number)}
            />
         </TreeTable>
         <DeleteTimesheetEntryModal />
      </>
   )
}

export default TimesheetTable