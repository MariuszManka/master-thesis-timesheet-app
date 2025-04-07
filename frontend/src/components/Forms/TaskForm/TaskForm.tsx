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
import { Button } from '@mui/material'
import { useSnackbar } from 'notistack'

import tasksService from 'services/TasksService/TasksService'
import { AppState } from 'store'
import { ITaskForm, resetTaskForm } from 'store/TasksSlice/TasksSlice'
import { isDateValid } from 'common/helpers/yupValidationsHelpers'
import { Environment } from 'environment/AppSettings'
import { AppLinks } from 'common/AppLinks'

import './TaskFormStyles.scss'
import '../FormStyles.scss'
import { MultiSelect } from 'primereact/multiselect'

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

const TaskForm = ({ isEditMode }: { isEditMode: boolean }) => {
   const { id } = useParams()
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const { enqueueSnackbar } = useSnackbar()
   const location = useLocation()
   const { isFromAdminPage } = location.state ?? {}

   // Redux State
   const { appTaskPriority, appTaskStatuses, appTaskTypes, appDatabaseDateFormatForFront, allTasksInfoArray, appAllUsersNames } = useSelector((state: AppState) => state.applicationState)
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
               startingDate: DateTime.fromFormat(localTaskForm.startingDate as string, Environment.dateFormatToDisplay).toFormat(appDatabaseDateFormatForFront),
               dueDate: localTaskForm.dueDate ? DateTime.fromFormat(localTaskForm.dueDate as string, Environment.dateFormatToDisplay).toFormat(appDatabaseDateFormatForFront) : undefined,
               estimatedHours: localTaskForm.estimatedHours ?? undefined,
               parentTaskId: localTaskForm.parentTaskId ?? undefined,
               assignedUsers: localTaskForm.assignedUsers.map(assignedUser => assignedUser.id),
            }

            if (isEditMode && id) {
               // await tasksService.updateSelectedTask({ updatedTaskData: completeTaskObject, currentTaskId: parseInt(id) })
               enqueueSnackbar(`Poprawnie zaktualizowano zadanie! #${id}`, { variant: 'success', autoHideDuration: 5000 })
               dispatch(resetTaskForm())
               setLocalTaskForm(taskForm)
               navigate(isFromAdminPage?  AppLinks.adminPanelViewAllTasks: AppLinks.tasks)
            } 
            else {
               await tasksService.createTask(completeTaskObject)
               enqueueSnackbar("Poprawnie dodano nowe zadanie!", { variant: 'success', autoHideDuration: 5000 })
               dispatch(resetTaskForm())
               setLocalTaskForm(taskForm)

               navigate(AppLinks.adminPanelViewAllTasks)
            }
            setValidationErrors({})
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
      <form className="app-page-form-wrapper" onSubmit={handleFormSubmit}>
         <h1>TODO : DODAĆ JEŚLI STARCZY CZASU MOŻLIWOŚĆ EDYCJI WARTOŚCI DROPDOWN W PROJEKCIE </h1>
         <h4 className="app-page-form-label">{isEditMode ? `Edytuj zadanie #${id}` : "Nowe zadanie"}</h4>

         <div className="app-page-form-input-wrapper app-page-form-full-width-input-wrapper">
            <label htmlFor="AddTaskSubject" className="required-label">Tytuł</label>
            <InputText
               id="AddTaskSubject" name="AddTaskSubject" className='app-page-form-input'
               value={localTaskForm.subject}
               invalid={!!validationErrors.subject}
               placeholder="Wprowadź tytuł zagadnienia"
               onChange={(e) => handleInputChange("subject", e.target.value)}
               type="text"
            />
            <small className="p-error app-form-helper-text">{validationErrors.subject}</small>
         </div>

         <div className="app-page-form-input-wrapper app-page-form-full-width-input-wrapper">
            <label htmlFor="AddTaskParentTaskId">Zagadnienie nadrzędne</label>
            <Dropdown
               id="AddTaskParentTaskId"
               showClear
               value={localTaskForm.parentTaskId}
               onChange={(e) => handleInputChange('parentTaskId', e.target.value)}
               options={allTasksInfoArray}
               optionLabel="label"
               optionValue="id"
               placeholder="Wybierz zadanie nadrzędne (opcjonalnie)"
               className="app-page-form-input"
            />
            <small className="p-error app-form-helper-text" /> {/* PLACEHOLDER */}
         </div>

         <div className="app-page-form-input-wrapper app-page-form-full-width-input-wrapper">
            <label htmlFor="AddTaskAssignedUserId">Przypisani użytkownicy</label>
            <MultiSelect 
               id="AddTaskAssignedUserId"
               value={localTaskForm.assignedUsers} optionLabel="user" options={appAllUsersNames} 
               onChange={(e) => handleInputChange("assignedUsers", e.value)} // Pass the selected values
               display="chip" placeholder="Przypisz użytkownika" 
               className="app-page-form-input" panelClassName="app-page-form-multiselect-input-panel"
            />
            <small className="p-error app-form-helper-text" /> {/* PLACEHOLDER */}
         </div>

         <div className="app-page-form-two-column-input-wrapper">
            <div className="app-page-form-input-wrapper">
               <label htmlFor="AddTaskType">Typ zagadnienia</label>
               <Dropdown
                  id="AddTaskType"
                  value={localTaskForm.taskType}
                  onChange={(e) => handleInputChange("taskType", e.target.value)}
                  options={appTaskTypes}
                  placeholder="Wybierz typ zagadnienia (opcjonalnie)"
                  className="app-page-form-input"
               />
               <small className="p-error app-form-helper-text" /> {/* PLACEHOLDER */}
            </div>
            <div className="app-page-form-input-wrapper">
               <label htmlFor="AddTaskStatus">Status</label>
               <Dropdown
                  id="AddTaskStatus"
                  value={localTaskForm.taskStatus}
                  onChange={(e) => handleInputChange("taskStatus", e.target.value)}
                  options={appTaskStatuses}
                  placeholder="Wybierz aktualny status (opcjonalnie)"
                  className="app-page-form-input"
               />
               <small className="p-error app-form-helper-text" /> {/* PLACEHOLDER */}
            </div>
         </div>

         <div className="app-page-form-two-column-input-wrapper">
            <div className="app-page-form-input-wrapper">
               <label htmlFor="AddTaskStartingDate" className="required-label">Data rozpoczęcia</label>
               <Calendar
                  id="AddTaskStartingDate"
                  value={localTaskForm.startingDate ? DateTime.fromFormat(localTaskForm.startingDate, Environment.dateFormatToDisplay).toJSDate() : null}
                  onChange={(e) => e.value ? handleInputChange("startingDate", DateTime.fromJSDate(e.value).toFormat(Environment.dateFormatToDisplay)) : null }
                  showIcon={true}
                  invalid={!!validationErrors.startingDate}
                  dateFormat={"dd/mm/yy"}
                  mask="99/99/9999"
                  maskSlotChar="DD/MM/RRRR"
                  placeholder="DD/MM/RRRR"
               />
               <small className="p-error app-form-helper-text">{validationErrors.startingDate}</small>
            </div>
            <div className="app-page-form-input-wrapper">
               <label htmlFor="AddTaskDueDate">Data zakończenia</label>
               <Calendar
                  id="AddTaskDueDate"
                  value={localTaskForm.dueDate ? DateTime.fromFormat(localTaskForm.dueDate, Environment.dateFormatToDisplay).toJSDate() : null}
                  onChange={(e) => e.value ? handleInputChange("dueDate", DateTime.fromJSDate(e.value).toFormat(Environment.dateFormatToDisplay)) : null }
                  showIcon={true}
                  invalid={!!validationErrors.dueDate}
                  dateFormat={"dd/mm/yy"}
                  mask="99/99/9999"
                  maskSlotChar="DD/MM/RRRR"
                  placeholder="DD/MM/RRRR"
               />
               <small className="p-error app-form-helper-text">{validationErrors.dueDate}</small>
            </div>
         </div>

         <div className="app-page-form-two-column-input-wrapper">
            <div className="app-page-form-input-wrapper">
               <label htmlFor="AddTaskPriority">Priorytet</label>
               <Dropdown
                  id="AddTaskPriority"
                  value={localTaskForm.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  invalid={!!validationErrors.priority}
                  options={appTaskPriority}
                  placeholder="Wybierz priorytet (opcjonalne)"
                  className="app-page-form-input"
               />
               <small className="p-error app-form-helper-text" /> {/* PLACEHOLDER */}
            </div>
            <div className="app-page-form-input-wrapper">
               <label htmlFor="AddTaskEstimatedHours">Szacowany czas</label>
               <InputNumber
                  name="AddTaskEstimatedHours"
                  inputId="AddTaskEstimatedHours"
                  invalid={!!validationErrors.estimatedHours}
                  value={localTaskForm.estimatedHours}
                  className="app-page-form-input"
                  placeholder="Czas w godzinach (opcjonalnie)"
                  min={0} max={1000}
                  maxFractionDigits={2}
                  onValueChange={(e) => handleInputChange("estimatedHours", e.value)}
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