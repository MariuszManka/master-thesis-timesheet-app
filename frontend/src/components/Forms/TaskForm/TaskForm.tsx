import React, { useState, useMemo, useCallback, useEffect } from 'react'
import * as Yup from 'yup'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { DateTime } from 'luxon'
import { Editor } from 'primereact/editor'
import { Autocomplete, Button, TextField } from '@mui/material'
import { useSnackbar } from 'notistack'

import tasksService from 'services/TasksService/TasksService'
import { AppState } from 'store'
import { ITaskForm, resetTaskForm, setCurrentAllTasksTableSettings } from 'store/TasksSlice/TasksSlice'
import { isDateValid } from 'common/helpers/yupValidationsHelpers'
import { Environment } from 'environment/AppSettings'
import { AppLinks } from 'common/AppLinks'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import projectsService, { IAllProjectsSubjectsModel } from 'services/ProjectsService/ProjectsService'
import AsyncAutocomplete from '../Inputs/AsyncAutoselect'
import settingsService, { IAllUsersNamesResponse, IFetchTaskInfoResponse } from 'services/SettingsService/SettingsService'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'


import './TaskFormStyles.scss'
import '../FormStyles.scss'

const RenderAddTaskEditorHeader = () => (
   <span className="ql-formats" style={{ height: 24 }}>
      <select className="ql-size">
         <option selected>Paragraf</option>
         <option value="large">Punkt</option>
         <option value="huge">Nagłówek</option>
      </select>
      <button className="ql-bold"></button>
      <button className="ql-strike" style={{ marginRight: 15 }}></button>
      <button className="ql-list" value="ordered"></button>
      <button className="ql-list" value="bullet"></button>
      <button className="ql-list" value="check" style={{ marginRight: 15 }}></button>
      <button className="ql-blockquote"></button>
      <button className="ql-code-block"></button>
      <button className="ql-link"></button>
      <button className="ql-image" style={{ marginRight: 15 }}></button>
   </span>
)

const TaskForm = ({ isEditMode, isOnlyFieldsMode }: { isEditMode: boolean, isOnlyFieldsMode?: boolean }) => {
   const { id } = useParams()
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const { enqueueSnackbar } = useSnackbar()
   const location = useLocation()
   const { isFromAdminPage } = location.state ?? {}

   // Redux State
   const { 
      appTaskPriority, appTaskStatuses, appTaskTypes, 
      appDatabaseDateFormatForFront, allTasksInfoArray, appAllUsersNames, currentUserAllProjectsSubjects
   } = useSelector((state: AppState) => state.applicationState)
   const  { createdDate, ...taskForm } = useSelector((state: AppState) => state.tasksState.taskForm)
   const currentUserRole = useSelector((state: AppState) => state.currentUserState.role)
 

   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
   const [localTaskForm, setLocalTaskForm] = useState<Omit<ITaskForm, 'createdDate'>>(taskForm)


   // Validation Schema
   const addTaskYupValidationSchema = useMemo(
      () =>
         Yup.object().shape({
            subject: Yup.string().required("Uzupełnij pole"),
            description: Yup.string().required("Uzupełnij pole"),
            startingDate: Yup.string().required("Uzupełnij pole").test(isDateValid),
            assignedUsers: Yup.array().min(1, "Wybierz co najmniej jednego użytkownika"),
            dueDate: Yup.string().notRequired().test(isDateValid),
         }),
      []
   )
   

   useEffect(() => {
      !isEditMode && dispatch(resetTaskForm())
   }, [])

   // Form Submit Handler
   const handleFormSubmit = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
         e.preventDefault()

         try {
            await addTaskYupValidationSchema.validate(localTaskForm, { abortEarly: false })
            
            const completeTaskObject = {
               ...localTaskForm,
               project_id: localTaskForm.project_id as number,
               startingDate: DateTime.fromFormat(localTaskForm.startingDate as string, Environment.dateFormatToDisplay).toFormat(appDatabaseDateFormatForFront),
               dueDate: localTaskForm.dueDate ? DateTime.fromFormat(localTaskForm.dueDate as string, Environment.dateFormatToDisplay).toFormat(appDatabaseDateFormatForFront) : undefined,
               estimatedHours: localTaskForm.estimatedHours ?? undefined,
               parentTaskId: localTaskForm.parentTaskId ?? undefined,
               assignedUsers: localTaskForm.assignedUsers !== null? localTaskForm.assignedUsers.map(assignedUser => assignedUser.id) : [],
            }

            if (isEditMode && id) {               
               try {
                  await tasksService.updateSelectedTask({ updatedTaskData: completeTaskObject, currentTaskId: parseInt(id) })
                  enqueueSnackbar(`Poprawnie zaktualizowano zadanie!`, { variant: 'success', autoHideDuration: 5000 })
               }
               catch (error: any) {
                  enqueueSnackbar(`Błąd. Nie udało się zaktualizować zadania!`, { variant: 'error', autoHideDuration: 5000, preventDuplicate: true })
                  return
               } 
            } 
            else {
               try {
                  await tasksService.createTask(completeTaskObject)
                  enqueueSnackbar("Poprawnie dodano nowe zadanie!", { variant: 'success', autoHideDuration: 5000 })
               }
               catch (error:  any){
                  enqueueSnackbar(`Błąd. Nie udało się dodać zadania!`, { variant: 'error', autoHideDuration: 5000, preventDuplicate: true })
                  return
               }
            }
            
            dispatch(resetTaskForm())
            setLocalTaskForm(taskForm)
            setValidationErrors({})

            dispatch(setCurrentAllTasksTableSettings({ offset: 0, limit: Environment.defaultRowsPerTablePage }))
            navigate(isFromAdminPage?  AppLinks.adminPanelViewAllTasks: AppLinks.tasks)
         } 
         catch (error: any) {
            if (error.inner) {
               const errors: Record<string, string> = {}
               
               error.inner.forEach((err: any) => (errors[err.path] = err.message))
               setValidationErrors(errors)
            }
         }
      },
      [localTaskForm, isEditMode, id, dispatch, navigate, enqueueSnackbar, addTaskYupValidationSchema]
   )


   const handleOnCancelButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      dispatch(resetTaskForm())
      setLocalTaskForm(taskForm)
      navigate(isFromAdminPage?  AppLinks.adminPanelViewAllTasks: AppLinks.tasks)
   }

   // Input Handlers
   const handleInputChange = useCallback((field: string, value: any) => {
      setLocalTaskForm((prev) => ({ ...prev, [field]: value }))
   }, [])



   return (
      <form className={`app-page-form-wrapper ${isOnlyFieldsMode === true ? 'app-form-wrapper-only-fields-mode' : ''}`} onSubmit={handleFormSubmit}>
         <h4 className="app-page-form-label">{isEditMode ? `Edycja zadania #${id}` : "Nowe zadanie"}</h4>

         <div className="app-page-form-input-wrapper app-page-form-full-width-input-wrapper">
            {!isOnlyFieldsMode === true && <label htmlFor="AddProjectSubject" className="required-label">Projekt</label>}
            <AsyncAutocomplete
               id="AddProjectSubject"
               sx={{ minWidth: 150 }}
               openOnFocus handleHomeEndKeys
               value={currentUserAllProjectsSubjects.find(task => task.id === localTaskForm.project_id) || undefined}
               onChange={(e, newValue) => handleInputChange('project_id', newValue.id)}
               fetchOptions={() => projectsService.fetchAllProjectsSubjectsList()}
               getOptionLabel={(option: IAllProjectsSubjectsModel) =>`[${option.id}] ${option.subject}`}
               isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
               renderInput={(params) => <TextField {...params} label={isOnlyFieldsMode === true ? "Projekt" : undefined} />}
            />
            <small className="p-error app-form-helper-text">{validationErrors.subject}</small>
         </div>
         <div className="app-page-form-input-wrapper app-page-form-full-width-input-wrapper">
            {!isOnlyFieldsMode === true && <label htmlFor="AddTaskSubject" className="required-label">Tytuł</label>}
            <TextField
               label={isOnlyFieldsMode === true ? "Tytuł" : undefined}
               id="AddTaskSubject" name="AddTaskSubject" className='app-page-form-input'
               value={localTaskForm.subject}
               error={!!validationErrors.subject}
               placeholder="Wprowadź tytuł zagadnienia"
               onChange={(e) => handleInputChange("subject", e.target.value)}
               type="text"
            />
            <small className="p-error app-form-helper-text">{validationErrors.subject}</small>
         </div>
         <div className="app-page-form-input-wrapper app-page-form-full-width-input-wrapper">
               {!isOnlyFieldsMode === true && <label htmlFor="AddTaskParentTaskId">Zagadnienie nadrzędne</label>}
               <AsyncAutocomplete
                  id="AddTaskParentTaskId"
                  sx={{ minWidth: 150 }}
                  openOnFocus handleHomeEndKeys
                  value={allTasksInfoArray.find(task => task.id === localTaskForm.parentTaskId) || undefined}
                  onChange={(e, newValue) => handleInputChange('parentTaskId', newValue ? newValue.id : null)}
                  fetchOptions={() => settingsService.fetchAllTasksInfo()}
                  getOptionLabel={(option: IFetchTaskInfoResponse) => option.label}
                  classes={{ root: 'app-page-form-input'}}
                  isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                  renderInput={(params) => (<TextField {...params} label={isOnlyFieldsMode === true ? "Zadanie nadrzędne" : undefined} />)}
               />
               <small className="p-error app-form-helper-text" /> {/* PLACEHOLDER */}

            <div className="app-page-form-input-wrapper app-page-form-full-width-input-wrapper">
               {!isOnlyFieldsMode === true && <label htmlFor="AddTaskAssignedUserId" className="required-label">Przypisani użytkownicy</label>}
                  <AsyncAutocomplete
                     id="AddTaskAssignedUserId"
                     sx={{ minWidth: 150 }}
                     multiple limitTags={3} openOnFocus handleHomeEndKeys
                     value={localTaskForm.assignedUsers !== null? localTaskForm.assignedUsers : []}
                     onChange={(e, newValue) => handleInputChange('assignedUsers', newValue)}
                     fetchOptions={() => settingsService.fetchAllUsersNamesByType(currentUserRole === SystemRoles.ADMIN? SystemRoles.MANAGER : SystemRoles.EMPLOYEE)}
                     getOptionLabel={(option: IAllUsersNamesResponse) => option.user}
                     isOptionEqualToValue={(opt: any, val: any) => opt.id === val.id}
                     classes={{ root: 'app-page-form-input', inputRoot: 'app-page-form-multiselect-input', tag: 'app-page-form-multiselect-input-tag'}}
                     renderInput={(params) => (<TextField {...params}  label={isOnlyFieldsMode === true ? "Przypisani użytkownicy" : undefined} />)}
                  />
               <small className="p-error app-form-helper-text">{validationErrors.assignedUsers}</small>
            </div>
         </div>
         <div className="app-page-form-two-column-input-wrapper">
            <div className="app-page-form-input-wrapper">
               {!isOnlyFieldsMode === true && <label htmlFor="AddTaskType">Typ zagadnienia</label>}
                  <Autocomplete
                     id="AddTaskType"
                     sx={{ minWidth: 150 }}
                     value={localTaskForm.taskType}
                     onChange={(e, newValue) => handleInputChange('taskType', newValue)}
                     openOnFocus	handleHomeEndKeys
                     options={appTaskTypes}
                     classes={{ root: 'app-page-form-input'}}
                     renderInput={(params) => (<TextField {...params} label={isOnlyFieldsMode === true ? "Wybierz typ zagadnienia (opcjonalnie)" : undefined} />)} 
                  />
               <small className="p-error app-form-helper-text" /> {/* PLACEHOLDER */}
            </div>
            <div className="app-page-form-input-wrapper">
               {!isOnlyFieldsMode === true && <label htmlFor="AddTaskStatus">Status</label>}
                  <Autocomplete
                     id="AddTaskStatus"
                     sx={{ minWidth: 150 }}
                     value={localTaskForm.taskStatus}
                     onChange={(e, newValue) => handleInputChange('taskStatus', newValue)}
                     openOnFocus	handleHomeEndKeys
                     options={appTaskStatuses}
                     classes={{ root: 'app-page-form-input'}}
                     renderInput={(params) => (<TextField {...params} label={isOnlyFieldsMode === true ? "Wybierz aktualny status (opcjonalnie)" : undefined} />)}
                  />
               <small className="p-error app-form-helper-text" /> {/* PLACEHOLDER */}
            </div>
         </div>

         <div className="app-page-form-two-column-input-wrapper">
            <div className="app-page-form-input-wrapper">
               {!isOnlyFieldsMode === true && <label htmlFor="AddTaskStartingDate" className="required-label">Data rozpoczęcia</label>}
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale='pl'>
               <DatePicker
                  slotProps={{ textField: { id: "AddTaskStartingDate" } }}
                  format={Environment.dateFormatToDisplay}
                  sx={{ width: '100%', minWidth: 150 }}
                  label={isOnlyFieldsMode === true ? "Data rozpoczęcia" : undefined}
                  value={localTaskForm.startingDate ? DateTime.fromFormat(localTaskForm.startingDate, Environment.dateFormatToDisplay) : null}
                  onChange={(selectedDateTimeObject: DateTime | null) => selectedDateTimeObject !== null && handleInputChange("startingDate", selectedDateTimeObject.toFormat(Environment.dateFormatToDisplay))}
               />
               </LocalizationProvider>
               <small className="p-error app-form-helper-text">{validationErrors.startingDate}</small>
            </div>
            <div className="app-page-form-input-wrapper">
               {!isOnlyFieldsMode === true && <label htmlFor="AddTaskDueDate">Data zakończenia</label>}  
               <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale='pl'>
                  <DatePicker
                     slotProps={{ textField: { id: "AddTaskDueDate" } }}
                     format={Environment.dateFormatToDisplay}
                     sx={{ width: '100%', minWidth: 150 }}
                     label={isOnlyFieldsMode === true ? "Data zakończenia" : undefined}
                     value={localTaskForm.dueDate ? DateTime.fromFormat(localTaskForm.dueDate, Environment.dateFormatToDisplay) : null}
                     onChange={(selectedDateTimeObject: DateTime | null) => selectedDateTimeObject !== null && handleInputChange("dueDate", selectedDateTimeObject.toFormat(Environment.dateFormatToDisplay))}
                  />
               </LocalizationProvider>
               <small className="p-error app-form-helper-text">{validationErrors.dueDate}</small>
            </div>
         </div>

         <div className="app-page-form-two-column-input-wrapper">
            <div className="app-page-form-input-wrapper">
               {!isOnlyFieldsMode === true && <label htmlFor="AddTaskPriority">Priorytet</label>}
                  <Autocomplete
                     id="AddTaskPriority"
                     sx={{ minWidth: 150 }}
                     value={localTaskForm.priority}
                     onChange={(e, newValue) => handleInputChange('priority', newValue)}
                     openOnFocus	handleHomeEndKeys
                     options={appTaskPriority}
                     classes={{ root: 'app-page-form-input'}}
                     renderInput={(params) => (<TextField {...params} label={isOnlyFieldsMode === true ? "Wybierz priorytet (opcjonalne)" : undefined}
                        />)}
                  />
               <small className="p-error app-form-helper-text" /> {/* PLACEHOLDER */}
            </div>
            <div className="app-page-form-input-wrapper">
               {!isOnlyFieldsMode === true && <label htmlFor="AddTaskEstimatedHours">Szacowany czas</label>}
               <TextField
                  type="number"
                  slotProps={{ htmlInput : { inputMode: 'decimal', min: 1, max: 500 } }}
                  label={isOnlyFieldsMode === true ? "Szacowany czas" : undefined}
                  id="AddTaskEstimatedHours" name="AddTaskEstimatedHours" className='app-page-form-input'
                  value={localTaskForm.estimatedHours}
                  error={!!validationErrors.estimatedHours}
                  placeholder="Czas w godzinach (opcjonalnie)"
                  onChange={(e) => handleInputChange("estimatedHours", parseFloat(e.target.value))}
               />
               <small className="p-error app-form-helper-text">{validationErrors.estimatedHours}</small>
            </div>
         </div>

         <div className="app-page-form-input-wrapper app-page-form-full-width-input-wrapper">
            <label htmlFor="AddTaskDescription" className="required-label">Opis zadania</label>
            <Editor
               value={localTaskForm.descriptionInHTMLFormat}
               onTextChange={(e) => {
                  handleInputChange("description", e.textValue); 
                  handleInputChange("descriptionInHTMLFormat", e.htmlValue)
               }}
               headerTemplate={RenderAddTaskEditorHeader()} modules={{ syntax: true }}
               style={{ height: "240px" }}
               placeholder='Dodaj szczegółowy opis zagadnienia' id="AddTaskDescription"
               pt={{ content: { style: { minHeight: 250, maxHeight: 250, overflowY: 'scroll' }}}}
               className={!!validationErrors.description?  'app-page-editor-error-state' : ''}
            />
            <small className="p-error app-form-helper-text">{validationErrors.description}</small>
         </div>

         <Button className="app-page-form-submit-button" variant="contained" type="submit">
            {isEditMode? "Zapisz zmiany" : "Dodaj zadanie"}
         </Button>
         {
            isEditMode && (
               <button className='app-page-form-cancel-button' onClick={handleOnCancelButtonClick}>
                  Anuluj
               </button>
            )
         }
      </form>
   )
}

export default TaskForm