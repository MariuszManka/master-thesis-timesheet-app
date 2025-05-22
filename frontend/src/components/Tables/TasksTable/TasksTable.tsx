import React, { MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import { FilterMatchMode } from 'primereact/api'
import { Tag } from 'primereact/tag'
import { useDispatch, useSelector } from 'react-redux'
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { Dropdown } from 'primereact/dropdown'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DateTime } from 'luxon'
import { Button } from 'primereact/button'
import { IconField } from 'primereact/iconfield'
import { InputText } from 'primereact/inputtext'
import { InputIcon } from 'primereact/inputicon'
import { Link } from '@mui/material'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dialog } from 'primereact/dialog'

import { AppLinks } from 'common/AppLinks'
import { AppState } from 'store'
import tasksService, { ITaskResponseModel } from 'services/TasksService/TasksService'
import { setAllTasks, setCurrentAllTasksTableSettings, setCurrentSelectedTaskForPreview, setTaskFormValues } from 'store/TasksSlice/TasksSlice'
import { Environment } from 'environment/AppSettings'
import { ITasksTableProps } from './TasksTableProps'
import { IAllUsersNamesResponse } from 'services/SettingsService/SettingsService'
import usePersistedState from 'common/hooks/usePersistedState'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';


import './TasksTableStyles.scss'
import '../TablesStyles.scss'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'
import { Divider } from 'primereact/divider'
import { IAllProjectsSubjectsModel } from 'services/ProjectsService/ProjectsService'



// ========================================== TABLES VIEWS DEFINITIONS ==========================================
   
export const DescriptionBodyTemplate = (rowData: ITaskResponseModel) => (
   <div className="tasks-table-view-all-users-full-name-body-wrapper" dangerouslySetInnerHTML={{ __html: rowData.description }}/>
)

// TODO - POPRACOWAĆ NAD WYGLĄDEM
const AssignedUsersBodyTemplate = (rowData: ITaskResponseModel) => (
   <div>
      {
         rowData.assignedUsers.map(assignedUser => {
            return (
               <Link key={assignedUser.id} href={"#"} >{`@${assignedUser.user}; `}</Link>
            )
         })
      }
   </div>
)

export const TaskTablePriorityBodyTemplate = (rowData: ITaskResponseModel) => {
   switch (rowData.priority) {
         case 'Niski':
            return (
               <Tag
                  className='table-tag-main-styles'
                  style={{ color: '#257343', background: '#d8f2e0', borderColor: "#257343"}} 
                  value={rowData.priority} severity="success" 
               />
            )
            

         case 'Normalny':
            return (
               <Tag
                  className='table-tag-main-styles' 
                  style={{ color: '#010440', background: '#d3d4ed', borderColor: '#010440' }} 
                  value={rowData.priority} severity="info" 
               />
            )

         case 'Ważny':
            return (
               <Tag 
                  className='table-tag-main-styles'
                  style={{ color: '#736d25', background: '#f2eed8',borderColor: '#736d25' }} 
                  value={rowData.priority} severity="warning" 
               />
            )
         
         case 'Pilny':
            return (
               <Tag 
                  className='table-tag-main-styles' 
                  style={{ color: '#732525', background: '#f2d8d8', borderColor: '#732525' }}
                  value={rowData.priority} severity="danger" 
               />
            )

         case 'Natychmiastowy':
            return (
               <Tag 
                  className='table-tag-main-styles' 
                  style={{ color: '#732525', background: '#f2d8d8', borderColor: '#732525' }} 
                  value={rowData.priority} icon={<PriorityHighOutlinedIcon style={{ width: 15, height: '100%' }}/>} severity="danger" 
               />
            )

         default:
            return null;
   }
}

export const TaskStatusBodyTemplate = (rowData: ITaskResponseModel) => (
   rowData.taskStatus !== null ? (
      <Tag
         className='table-tag-main-styles'
         style={{ color: '#010440', background: 'transparent', border: 'none', justifyContent: 'flex-start'  }} 
         icon={<InfoOutlinedIcon style={{ width: 20, marginRight: 5 }} />} 
         value={rowData.taskStatus} severity="info" 
      />
   ) :
   <div /> // PLACEHOLDER
)

export const DateBodyTemplate = (dateToConvert: string | null, appDatabaseDateFormatForFront: string) => (
   dateToConvert !== null ? 
   <p>{DateTime.fromFormat(dateToConvert, appDatabaseDateFormatForFront).toFormat("dd/MM/yyyy")}</p> :
   <p />
)
   
export const EstimatedHoursBodyTemplate = (time: number | null | undefined ) => (
   (time !== null && time !== undefined) ? <p>{time}h</p> : <p></p>
)
   

export const TaskTypeBodyTemplate = (rowData: ITaskResponseModel) => {
   switch (rowData.taskType) {
      case 'Zadanie':
         return (
            <Tag 
               style={{ width: 120, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', color: '#66d166', background: 'transparent' }} 
               icon={<TaskAltOutlinedIcon style={{ width: 20, marginRight: 5 }}/>} 
               value={rowData.taskType} severity="success" 
            />
         )
         
      case 'Błąd':
         return (
            <Tag 
               style={{ width: 120, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', color: '#732525', background: 'transparent' }} 
               icon={<ErrorOutlineOutlinedIcon style={{ width: 20, marginRight: 5 }}/>} 
               value={rowData.taskType} severity="danger" 
            />
         ) 
         
      case 'Spotkanie':
         return (
            <Tag 
               style={{ width: 120, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', color: '#4c1952', background: 'transparent' }} 
               icon={<VideocamOutlinedIcon style={{ width: 20, marginRight: 5 }}/>} 
               value={rowData.taskType} severity="info" 
            />
         ) 
      case 'Testy':
         return (
            <Tag 
               style={{ width: 120, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', color: '#736d25', background: 'transparent' }} 
               icon={<BugReportOutlinedIcon style={{ width: 20, marginRight: 5 }}/>} 
               value={rowData.taskType} severity="info" 
            />
         ) 
      
      case 'Wsparcie':
         return (
            <Tag 
               style={{ width: 120, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', color: '#4c1952', background: 'transparent' }} 
               icon={<SupportAgentOutlinedIcon style={{ width: 20, marginRight: 5 }}/>} 
               value={rowData.taskType} severity="warning" 
            />
         ) 

      default:
         return null;
   }
}

// ==============================================================================================================

const TasksTable = (props: ITasksTableProps) => {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { enqueueSnackbar } = useSnackbar()
   
   const { appDatabaseDateFormatForFront, appAllUsersNames, currentUserAllProjectsSubjects } = useSelector((state: AppState) => state.applicationState)
   const currentTableSettings = useSelector((state: AppState) => state.tasksState.currentTableSettings)
   const currentUserRole = useSelector((state: AppState) => state.currentUserState.role)
   const IS_EMPLOYEE = currentUserRole === SystemRoles.EMPLOYEE
   
   const [selectedTaskRow, setSelectedTaskRow] = useState<ITaskResponseModel | null>(null)
   const [isLoading, setIsLoading] = useState(false)
   const [isDialogVisible, setIsDialogVisible] = useState(false)
   const [globalFilterValue, setGlobalFilterValue] = useState('')
   const [tasks, setTasks] = useState<ITaskResponseModel[]>([])
   const [totalRecords, setTotalRecords] = useState(0)
   const [lazyParams, setLazyParams] = useState({ first: currentTableSettings.offset, rows: currentTableSettings.limit, filter: '' })
   const [currentSelectedUserForDataFetching, setCurrentSelectedUserForDataFetching] = useState<IAllUsersNamesResponse | undefined>(
      undefined
      // appAllUsersNames.filter(userName => userName.id === props.userId)[0] || currentTableSettings.selectedUserObject
   )
   const [currentSelectedProjectForDataFetching, setCurrentSelectedProjectForDataFetching] = useState<IAllProjectsSubjectsModel | undefined>(undefined)

   // ====================================== FUNKCJE ======================================
   useEffect(() => {
      loadLazyData()
   }, [ lazyParams, currentSelectedUserForDataFetching, currentSelectedProjectForDataFetching ])


   const loadLazyData = useCallback(async () => {
      try {
         setIsLoading(true)
         const response = await tasksService.fetchAllTasksList(
            lazyParams.first, lazyParams.rows, currentSelectedUserForDataFetching?.id, currentSelectedProjectForDataFetching?.id, lazyParams.filter
         )
         dispatch(setAllTasks(response.tasks))
         setTasks(response.tasks)
         setTotalRecords(response.total)
      } 
      catch (error) {
         enqueueSnackbar("Nie udało się odczytać listy zadań.", { variant: "error", autoHideDuration: 5000, preventDuplicate: true })
         navigate(AppLinks.adminPanel)
      } 
      finally {
         setIsLoading(false)
      }
   }, [ lazyParams, currentSelectedUserForDataFetching, currentSelectedProjectForDataFetching ])


   
   const onPageChange = useCallback((event: any) => {
      dispatch(setCurrentAllTasksTableSettings({ limit: event.rows as number, offset: event.first }))
      setLazyParams(event)
   }, [ dispatch ])


   // Funkcja obsługująca kontrolkę z filtrowaniem danych z tabeli
   const onGlobalFilterChange = (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if(lazyParams.filter !== globalFilterValue){ // Zapobiegamy klikaniu w przycisk, gdy wartość kontrolki się nie zmieniła
         setLazyParams(prev => ({ ...prev, filter: globalFilterValue })) // Update filter param
      }
   }


   const handleOnDeleteSelectedRow = useCallback(async () => {
      if (!selectedTaskRow) return;

      try {
         setIsLoading(true);
         await tasksService.deleteSelectedTask(selectedTaskRow.id);
         enqueueSnackbar(`Poprawnie usunięto zadanie #${selectedTaskRow.id}`, { variant: 'success', autoHideDuration: 5000 });

         setIsDialogVisible(false);
         setSelectedTaskRow(null);
         loadLazyData();
      } catch (error) {
         enqueueSnackbar("Nie udało się usunąć zadania.", { variant: "error", autoHideDuration: 5000, preventDuplicate: true });
         setIsDialogVisible(false);
         setSelectedTaskRow(null);
      } finally {
         setIsLoading(false);
      }
   }, [ selectedTaskRow, loadLazyData, enqueueSnackbar ])

   const handleOnGlobalFilterInputClearIconClick = () => {
      if(globalFilterValue !== '') {
         setLazyParams(prev => ({ ...prev, filter: '' })) 
         setGlobalFilterValue('')
      }
   }


   const handleOnTaskPreview = (currentSelectedTask: ITaskResponseModel) => {
      dispatch(setCurrentSelectedTaskForPreview(currentSelectedTask))
      navigate(`${AppLinks.tasksViewSingleTask}/${currentSelectedTask.id}`)
   }
   // ==================================================================================


   const parentTaskIdBodyTemplate = (rowData: ITaskResponseModel) => {      
      const handleOnLinkClick = () => { 
         if(!rowData.parentTask){
            console.error("Nie można znaleźć zadania nadrzędnego")
            return
         }

         const parentTaskObject = rowData.parentTask
         
         dispatch(setTaskFormValues({
            project_id: parentTaskObject.project_id,
            subject: parentTaskObject.subject,
            description: parentTaskObject.descriptionInHTMLFormat,
            descriptionInHTMLFormat: parentTaskObject.descriptionInHTMLFormat,
            taskType: parentTaskObject.taskType,
            taskStatus: parentTaskObject.taskStatus,
            priority: parentTaskObject.priority,
            startingDate:  parentTaskObject.startingDate? DateTime.fromFormat(parentTaskObject.startingDate, appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay) : null,
            dueDate: parentTaskObject.dueDate? DateTime.fromFormat(parentTaskObject.dueDate, appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay) : null,
            parentTaskId: parentTaskObject.parentTaskId,
            estimatedHours: parentTaskObject.estimatedHours,
            assignedUsers: parentTaskObject.assignedUsers,
         }))

         navigate(`${AppLinks.tasksEditSingleTask}/${rowData.parentTaskId}`, { state: { fromNavigation: true }})
      } 
      return (
         rowData.parentTaskId !== null ? 
         <p style={{color: '#1976d2', textDecoration: 'underline', textDecorationColor: 'rgba(25, 118, 210, 0.4)' }} onClick={handleOnLinkClick}>#{rowData.parentTaskId}</p> :
         <p/>
      )
   }
   

   const renderTaskTableHeader = () => {
      return (
         <>
            <div className='tasks-table-search-header'>
               <div className='tasks-table-search-header-dropdowns-wrapper'>
                  <Dropdown 
                     id='TaskTableSelectUser'
                     optionLabel='user'
                     value={currentSelectedUserForDataFetching}
                     onChange={(e) => {
                        setCurrentSelectedUserForDataFetching(e.value)
                        dispatch(setCurrentAllTasksTableSettings({ ...currentTableSettings, selectedUserObject: e.value }))
                     }}
                     options={appAllUsersNames}
                     placeholder='Wybierz użytkownika'
                     className='task-table-choose-user-dropdown'
                     showClear={true}
                     />
                  <Dropdown 
                     id='TaskTableSelectProject'
                     optionLabel='subject'
                     value={currentSelectedProjectForDataFetching}
                     onChange={(e) => {                     
                        setCurrentSelectedProjectForDataFetching(e.value)
                        dispatch(setCurrentAllTasksTableSettings({ ...currentTableSettings, selectedProjectObject: e.value }))
                     }}
                     options={currentUserAllProjectsSubjects}
                     placeholder='Wybierz projekt'
                     className='task-table-choose-user-dropdown'
                     showClear={true}
                  />
               </div>
               <form className="p-inputgroup tasks-table-search-header-search-input-form-wrapper" onSubmit={(e) => onGlobalFilterChange(e)}>
                  <IconField iconPosition='right' >
                     <InputIcon className='pi pi-times' style={{ cursor: 'pointer' }} onClick={handleOnGlobalFilterInputClearIconClick}/>
                     <InputText placeholder="Szukaj" value={globalFilterValue} onChange={(e) => setGlobalFilterValue(e.target.value)} className='tasks-table-search-header-search-input'/>
                  </IconField>
                  <Button icon="pi pi-search" className='tasks-table-search-header-search-button' style={{borderRight: '1px solid #FFF'}} onClick={(e) => onGlobalFilterChange(e)} type='submit' />
               </form>
            </div>
            <span className={`tasks-table-header-divider ${IS_EMPLOYEE && 'divider-disable'}`} />
            {
               
               <div className='tasks-table-actions-header'>
                  {
                     !IS_EMPLOYEE &&
                     <div style={{ display: 'flex', columnGap: 20 }}>
                        <Button className='delete-action-table-button' label="Usuń" icon="pi pi-trash" severity="danger" onClick={() => setIsDialogVisible(true)} />
                        <Button 
                           className='edit-task-page-header-edit-button' icon="pi pi-pen-to-square" 
                           label="Edytuj" disabled={Boolean(!selectedTaskRow?.id)}  severity="info" 
                           onClick={(e) => {
                              if(selectedTaskRow !== null){

                                 //TODO MAGISTERKA - WYTŁUMACZYĆ TEN MECHANIZM
                                 //TODO SERIALIZACJA DATY - ERROR - POPRAWIĆ

                                 dispatch(setTaskFormValues({
                                    project_id: selectedTaskRow.project_id,
                                    subject: selectedTaskRow.subject,
                                    description: selectedTaskRow.descriptionInHTMLFormat,
                                    descriptionInHTMLFormat: selectedTaskRow.descriptionInHTMLFormat,
                                    taskType: selectedTaskRow.taskType,
                                    taskStatus: selectedTaskRow.taskStatus,
                                    priority: selectedTaskRow.priority,
                                    startingDate:  selectedTaskRow.startingDate? DateTime.fromFormat(selectedTaskRow.startingDate, appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay) : null,
                                    dueDate: selectedTaskRow.dueDate? DateTime.fromFormat(selectedTaskRow.dueDate, appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay) : null,
                                    parentTaskId: selectedTaskRow.parentTaskId,
                                    estimatedHours: selectedTaskRow.estimatedHours,
                                    assignedUsers: selectedTaskRow.assignedUsers,
                                 })) 
                                 navigate(`${AppLinks.tasksEditSingleTask}/${selectedTaskRow?.id}`, { state: { fromNavigation: true, isFromAdminPage: props.isAdminMode }})
                              }
                           }} 
                        />
                     </div>
                  }
                  {
                     !props.isAdminMode &&
                     <div>
                        <Button 
                           disabled={Boolean(!selectedTaskRow?.id)}
                           className='edit-task-page-header-edit-button' 
                           label="Podgląd" icon="pi pi-eye" severity="info"
                           onClick={() => handleOnTaskPreview(selectedTaskRow as ITaskResponseModel)} 
                        />
                     </div>
                  }
             </div>
            }
         </>
      )
   }

   const dialogFooterContent = (
      <div>
         <Button label="Tak" icon="pi pi-check" onClick={() => handleOnDeleteSelectedRow()} autoFocus className='app-table-delete-modal-button agree-button'/>
         <Button label="Nie" icon="pi pi-times" onClick={() => setIsDialogVisible(false)} className="app-table-delete-modal-button disagree-button" />
      </div>
   )

   return (
      <>
         <DataTable className='app-table-outer-wrapper'
            selectionMode="single" columnResizeMode="expand" paginator lazy 
            selection={selectedTaskRow!}
            dataKey="id" size='normal'  
            scrollable style={{ maxWidth: 'calc(90vw - 300px)' }}
            value={tasks} loading={isLoading}
            globalFilterFields={['id', 'subject', 'priority', 'taskType', 'taskStatus']}
            emptyMessage="Brak zadań"
            first={lazyParams.first} rows={lazyParams.rows} totalRecords={totalRecords}
            onPage={onPageChange} header={renderTaskTableHeader()}
            onSelectionChange={(e) => setSelectedTaskRow(e.value)}
            onRowDoubleClick={(e) => !props.isAdminMode && handleOnTaskPreview(e.data as ITaskResponseModel)}
         >
            <Column field="id" header="Id" style={{ minWidth: 50, maxHeight: 50, textAlign: 'center' }} />
            <Column field="subject" header="Tytuł" style={{ textAlign: 'left', minWidth: 250 }} />
            <Column field="projectName" header="Projekt" style={{ textAlign: 'left', minWidth: 250 }} />
            <Column field="priority" header="Priorytet"  body={TaskTablePriorityBodyTemplate} />
            <Column field="assignedUsers" header="Przypisani użytkownicy" style={{ minWidth: 400, maxHeight: 50 }} body={AssignedUsersBodyTemplate} />
            <Column field="description" header="Opis" style={{ minWidth: 400, maxHeight: 50 }} body={DescriptionBodyTemplate} />
            <Column field="startingDate" header="Data rozpoczęcia" style={{ textAlign: 'center' }} body={(rowData: ITaskResponseModel) => DateBodyTemplate(rowData.startingDate, appDatabaseDateFormatForFront)} />
            <Column field="dueDate" header="Data zakończenia" style={{ textAlign: 'center' }}  body={(rowData: ITaskResponseModel) => DateBodyTemplate(rowData.dueDate ?? null, appDatabaseDateFormatForFront)} />
            <Column field="taskType" header="Typ zagadnienia" body={TaskTypeBodyTemplate} /> 
            <Column field="taskStatus" header="Status" body={TaskStatusBodyTemplate} />
            <Column field="estimatedHours" header="Szacowany czas" style={{ textAlign: 'center' }} body={(rowData: ITaskResponseModel) => EstimatedHoursBodyTemplate(rowData.estimatedHours)} />
            <Column field="total_time_spent_in_hours" header="Przepracowany czas" style={{ textAlign: 'left', minWidth: 50  }} body={(rowData: ITaskResponseModel) => EstimatedHoursBodyTemplate(rowData.total_time_spent_in_hours)}/>
            <Column field="parentTaskId" header="Zadanie nadrzędne" style={{ textAlign: 'center' }} body={parentTaskIdBodyTemplate} /> 

         </DataTable>
         <Dialog 
            header="Potwierdź akcję" visible={isDialogVisible} style={{ width: '35vw' }} draggable={false} resizable={false}
            onHide={() => setIsDialogVisible(false)} footer={dialogFooterContent}
         >
            Czy na pewno chcesz usunąć zadanie: <br/>
            <b>{`[${selectedTaskRow?.id}] ${selectedTaskRow?.subject}?`}</b>
         </Dialog>
      </>
   )
}

export default TasksTable




{/* <Column field="id" header="Id" sortable style={{ minWidth: 30, maxHeight: 50, textAlign: 'center' }} />
<Column field="subject" header="Tytuł" style={{ minWidth: 250, maxHeight: 50 }} />
<Column field="priority" header="Priorytet" style={{ minWidth: 100, maxHeight: 50 }} body={PriorityBodyTemplate} />
<Column field="startingDate" header="Data rozpoczęcia" sortable style={{ minWidth: 85, maxHeight: 50 }} body={(rowData: ITaskResponseModel) => DateBodyTemplate(rowData.startingDate, appDatabaseDateFormatForFront)} />
<Column field="dueDate" header="Data zakończenia" sortable style={{ minWidth: 85, maxHeight: 50 }} body={(rowData: ITaskResponseModel) => DateBodyTemplate(rowData.dueDate ?? null, appDatabaseDateFormatForFront)} />
<Column field="description" header="Opis" style={{ minWidth: 400, maxHeight: 50 }} body={DescriptionBodyTemplate} />
<Column field="assignedUsers" header="Przypisani użytkownicy" style={{ minWidth: 400, maxHeight: 50 }} body={AssignedUsersBodyTemplate} />
<Column field="taskType" header="Typ zagadnienia" style={{ minWidth: 100, maxHeight: 50 }} body={TaskTypeBodyTemplate} /> 
<Column field="taskStatus" header="Status" style={{ minWidth: 100, maxHeight: 50 }} body={TaskStatusBodyTemplate} />
<Column field="estimatedHours" header="Szacowany czas" style={{ minWidth: 60, maxHeight: 50 }} body={EstimatedHoursBodyTemplate} />
<Column field="parentTaskId" header="Zadanie nadrzędne" style={{ minWidth: 60, maxHeight: 50 }} body={parentTaskIdBodyTemplate} />  */}