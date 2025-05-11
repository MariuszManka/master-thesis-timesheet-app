import React, { useState, useMemo, useCallback, useRef, useEffect, useDeferredValue } from 'react'
import * as Yup from 'yup'
import { Dropdown } from 'primereact/dropdown' 
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { DateTime } from 'luxon'
import { InputText } from 'primereact/inputtext'
import { Editor } from 'primereact/editor'
import { Calendar } from 'primereact/calendar'
import { InputNumber } from 'primereact/inputnumber'
import { Autocomplete, Button, TextField } from '@mui/material'
import { useSnackbar } from 'notistack'

import tasksService from 'services/TasksService/TasksService'
import { AppState } from 'store'
import { defaultTaskFormObject, ITaskForm, resetTaskForm } from 'store/TasksSlice/TasksSlice'
import { isDateValid } from 'common/helpers/yupValidationsHelpers'
import { Environment } from 'environment/AppSettings'
import { AppLinks } from 'common/AppLinks'

import './TaskFormStyles.scss'
import '../FormStyles.scss'
import { MultiSelect } from 'primereact/multiselect'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import projectsService, { IAllProjectsSubjectsModel } from 'services/ProjectsService/ProjectsService'

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
 

   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
   const [localTaskForm, setLocalTaskForm] = useState<Omit<ITaskForm, 'createdDate'>>(taskForm)


   // Validation Schema
   const addTaskYupValidationSchema = useMemo(
      () =>
         Yup.object().shape({
            subject: Yup.string().required("Uzupełnij pole"),
            description: Yup.string().required("Uzupełnij pole"),
            startingDate: Yup.string().required("Uzupełnij pole").test(isDateValid),
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
               await tasksService.updateSelectedTask({ updatedTaskData: completeTaskObject, currentTaskId: parseInt(id) })
               enqueueSnackbar(`Poprawnie zaktualizowano zadanie! #${id}`, { variant: 'success', autoHideDuration: 5000 })
            } 
            else {
               await tasksService.createTask(completeTaskObject)
               enqueueSnackbar("Poprawnie dodano nowe zadanie!", { variant: 'success', autoHideDuration: 5000 })
            }
            
            dispatch(resetTaskForm())
            setLocalTaskForm(taskForm)
            setValidationErrors({})

            navigate(isFromAdminPage?  AppLinks.adminPanelViewAllTasks: AppLinks.tasks)
         } 
         catch (error: any) {
            if (error.inner) {
               const errors: Record<string, string> = {}
               console.log("error", error);
               
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
         <h4 className="app-page-form-label">{isEditMode ? `Edytuj zadanie #${id}` : "Nowe zadanie"}</h4>

         <div className="app-page-form-input-wrapper app-page-form-full-width-input-wrapper">
            {!isOnlyFieldsMode === true && <label htmlFor="AddProjectSubject" className="required-label">Projekt</label>}
            <Autocomplete
               id="AddProjectSubject"
               sx={{ minWidth: 150 }}
               value={currentUserAllProjectsSubjects.find(task => task.id === localTaskForm.project_id) || undefined}
               onChange={(e, newValue) => handleInputChange('project_id', newValue.id)}
               disableClearable
               openOnFocus	
               handleHomeEndKeys
               options={currentUserAllProjectsSubjects}
               getOptionLabel={(option) => `[${option.id}] ${option.subject}`}
               renderInput={(params) => (<TextField {...params} label="Projekt" />)}
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
         <div className="app-page-form-two-column-input-wrapper">
            <div className="app-page-form-input-wrapper">
               {!isOnlyFieldsMode === true && <label htmlFor="AddTaskParentTaskId">Zagadnienie nadrzędne</label>}
               {/* <Autocomplete
                  id="AddTaskParentTaskId"
                  value={localTaskForm.parentTaskId}
                  getOptionLabel={(option) => option.label}
                  onChange={(e) => handleInputChange('parentTaskId', e.target.value)}
                  options={allTasksInfoArray}
                  // optionLabel="label"
                  // optionValue="id"
                  // placeholder="Wybierz zadanie nadrzędne (opcjonalnie)"
                  className="app-page-form-input"
               /> */}

               <Autocomplete
                  id="AddTaskParentTaskId"
                  sx={{ minWidth: 150 }}
                  value={allTasksInfoArray.find(task => task.id === localTaskForm.parentTaskId) || undefined}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(e, newValue) => handleInputChange('parentTaskId', newValue ? newValue.id : null)}
                  openOnFocus	handleHomeEndKeys
                  options={allTasksInfoArray}
                  classes={{ root: 'app-page-form-input'}}
                  renderInput={(params) => (<TextField {...params} label={isOnlyFieldsMode === true ? "Wybierz zadanie nadrzędne (opcjonalnie)" : undefined} />)}
               />
               <small className="p-error app-form-helper-text" /> {/* PLACEHOLDER */}
            </div>

            <div className="app-page-form-input-wrapper">
            {!isOnlyFieldsMode === true && <label htmlFor="AddTaskAssignedUserId">Przypisani użytkownicy</label>}
               {/* <MultiSelect 
                  id="AddTaskAssignedUserId"
                  value={localTaskForm.assignedUsers} optionLabel="user" options={appAllUsersNames} 
                  onChange={(e) => handleInputChange("assignedUsers", e.value)} // Pass the selected values
                  display="chip" placeholder="Przypisz użytkownika" 
                  className="app-page-form-input" panelClassName="app-page-form-multiselect-input-panel"
               /> */}
                  <Autocomplete
                     id="AddTaskAssignedUserId"
                     sx={{ minWidth: 150 }}
                     multiple limitTags={2}
                     value={localTaskForm.assignedUsers !== null? localTaskForm.assignedUsers : []}
                     getOptionLabel={(option) => option.user}
                     isOptionEqualToValue={(option, value) => option.id === value.id}
                     onChange={(e, newValue) => handleInputChange('assignedUsers', newValue)}
                     openOnFocus	handleHomeEndKeys
                     options={appAllUsersNames} 
                     classes={{ root: 'app-page-form-input', inputRoot: 'app-page-form-multiselect-input', tag: 'app-page-form-multiselect-input-tag'}}
                     renderInput={(params) => (<TextField {...params}  label={isOnlyFieldsMode === true ? "Przypisani użytkownicy" : undefined} />)}
                  />
               <small className="p-error app-form-helper-text" /> {/* PLACEHOLDER */}
            </div>
         </div>
         <div className="app-page-form-two-column-input-wrapper">
            <div className="app-page-form-input-wrapper">
               {!isOnlyFieldsMode === true && <label htmlFor="AddTaskType">Typ zagadnienia</label>}

               {/* <Dropdown
                  id="AddTaskType"
                  value={localTaskForm.taskType}
                  onChange={(e) => handleInputChange("taskType", e.target.value)}
                  options={appTaskTypes}
                  placeholder="Wybierz typ zagadnienia (opcjonalnie)"
                  className="app-page-form-input"
               /> */}
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
               {/* <Dropdown
                  id="AddTaskStatus"
                  value={localTaskForm.taskStatus}
                  onChange={(e) => handleInputChange("taskStatus", e.target.value)}
                  options={appTaskStatuses}
                  placeholder="Wybierz aktualny status (opcjonalnie)"
                  className="app-page-form-input"
               /> */}
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
               {/* <Calendar
                  id="AddTaskStartingDate"
                  value={localTaskForm.startingDate ? DateTime.fromFormat(localTaskForm.startingDate, Environment.dateFormatToDisplay).toJSDate() : null}
                  onChange={(e) => e.value ? handleInputChange("startingDate", DateTime.fromJSDate(e.value).toFormat(Environment.dateFormatToDisplay)) : null }
                  showIcon={true}
                  invalid={!!validationErrors.startingDate}
                  dateFormat={"dd/mm/yy"}
                  mask="99/99/9999"
                  maskSlotChar="DD/MM/RRRR"
                  placeholder="DD/MM/RRRR"
               /> */}
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
               {/* <Calendar
                  id="AddTaskDueDate"
                  value={localTaskForm.dueDate ? DateTime.fromFormat(localTaskForm.dueDate, Environment.dateFormatToDisplay).toJSDate() : null}
                  onChange={(e) => e.value ? handleInputChange("dueDate", DateTime.fromJSDate(e.value).toFormat(Environment.dateFormatToDisplay)) : null }
                  showIcon={true}
                  invalid={!!validationErrors.dueDate}
                  dateFormat={"dd/mm/yy"}
                  mask="99/99/9999"
                  maskSlotChar="DD/MM/RRRR"
                  placeholder="DD/MM/RRRR"
               /> */}
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
               {/* <Dropdown
                  id="AddTaskPriority"
                  value={localTaskForm.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  invalid={!!validationErrors.priority}
                  options={appTaskPriority}
                  placeholder="Wybierz priorytet (opcjonalne)"
                  className="app-page-form-input"
               /> */}
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
               {/* <InputNumber
                  name="AddTaskEstimatedHours"
                  inputId="AddTaskEstimatedHours"
                  invalid={!!validationErrors.estimatedHours}
                  value={localTaskForm.estimatedHours}
                  className="app-page-form-input"
                  placeholder="Czas w godzinach (opcjonalnie)"
                  min={0} max={1000}
                  maxFractionDigits={2}
                  onValueChange={(e) => handleInputChange("estimatedHours", e.value)}
               /> */}
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