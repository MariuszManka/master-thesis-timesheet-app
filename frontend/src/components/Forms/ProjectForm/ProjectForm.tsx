import React, { useState, useMemo, useCallback, useRef, useEffect, useDeferredValue } from 'react'
import * as Yup from 'yup'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { DateTime } from 'luxon'
import { Autocomplete, Button, TextareaAutosize, TextField } from '@mui/material'
import { useSnackbar } from 'notistack'

import { AppState } from 'store'
import { isDateValid } from 'common/helpers/yupValidationsHelpers'
import { Environment } from 'environment/AppSettings'
import { AppLinks } from 'common/AppLinks'
import { IProjectForm, resetProjectForm } from 'store/ProjectsSlice/ProjectsSlice'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import projectsService from 'services/ProjectsService/ProjectsService'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'
import AsyncAutocomplete from '../Inputs/AsyncAutoselect'
import settingsService, { IAllUsersNamesResponse, IFetchTaskInfoResponse } from 'services/SettingsService/SettingsService'

import './ProjectFormStyles.scss'
import '../FormStyles.scss'


const ProjectForm = ({ isEditMode, isOnlyFieldsMode }: { isEditMode: boolean, isOnlyFieldsMode?: boolean }) => {
   const { id } = useParams()
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const { enqueueSnackbar } = useSnackbar()

   // Redux State
   const { appDatabaseDateFormatForFront, appAllUsersNamesByType: appManagersUsers, appProjectStatuses, appAllUsersNames, allTasksInfoArray } = useSelector((state: AppState) => state.applicationState)
   const  { ...projectForm } = useSelector((state: AppState) => state.projectsState.projectForm)
   const currentUserRole = useSelector((state: AppState) => state.currentUserState.role)
 


   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
   const [localProjectForm, setLocalProjectForm] = useState<IProjectForm>(projectForm)


   // Validation Schema
   const addProjectYupValidationSchema = useMemo(
      () =>
         Yup.object().shape({
            name: Yup.string().required("Uzupełnij pole"),
            description: Yup.string().required("Uzupełnij pole"),
            start_date: Yup.string().required("Uzupełnij pole").test(isDateValid),
            end_date: Yup.string().required("Uzupełnij pole").test(isDateValid),
            status: Yup.string().required("Uzupełnij pole"),
            owner_id: Yup.number().required("Uzupełnij pole").positive().integer(),
         }),
      []
   )
   

   useEffect(() => {
      !isEditMode && dispatch(resetProjectForm())
   }, [])

   // Form Submit Handler
   const handleFormSubmit = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
         e.preventDefault()
         
         try {
            await addProjectYupValidationSchema.validate(localProjectForm, { abortEarly: false })
            
            let completeProjectObject = {
               ...localProjectForm,
               name: localProjectForm.name,
               description: localProjectForm.description,
               start_date: DateTime.fromFormat(localProjectForm.start_date as string, Environment.dateFormatToDisplay).toFormat(appDatabaseDateFormatForFront),
               end_date: DateTime.fromFormat(localProjectForm.end_date as string, Environment.dateFormatToDisplay).toFormat(appDatabaseDateFormatForFront),
               status: localProjectForm.status,
               owner_id: localProjectForm.owner_id,
            }

            if (isEditMode && id) {      
               completeProjectObject = {...completeProjectObject, participants: localProjectForm.participants, assignedTasks: localProjectForm.assignedTasks}
               
               await projectsService.updateSelectedProject({ updatedProjectData: completeProjectObject, currentProjectId: parseInt(id) })
               enqueueSnackbar(`Poprawnie zaktualizowano projekt! #${id}`, { variant: 'success', autoHideDuration: 5000 })
            } 
            else {
               await projectsService.createProject(completeProjectObject)
               enqueueSnackbar("Poprawnie dodano nowy projekt!", { variant: 'success', autoHideDuration: 5000 })
            }
            
            dispatch(resetProjectForm())
            setLocalProjectForm(projectForm)
            setValidationErrors({})

            navigate(AppLinks.projects)
         } 
         catch (error: any) {
            if (error.inner) {
               const errors: Record<string, string> = {}
               
               error.inner.forEach((err: any) => (errors[err.path] = err.message))
               setValidationErrors(errors)
            }
         }
      },
      [localProjectForm, isEditMode, id, dispatch, navigate, enqueueSnackbar, addProjectYupValidationSchema]
   )


   const handleOnCancelButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      dispatch(resetProjectForm())
      setLocalProjectForm(projectForm)
      navigate(AppLinks.projects)
   }

   // Input Handlers
   const handleInputChange = useCallback((field: string, value: any) => {
      setLocalProjectForm((prev) => ({ ...prev, [field]: value }))
   }, [])



   return (
      <form className={`app-page-form-wrapper ${isOnlyFieldsMode === true ? 'app-form-wrapper-only-fields-mode' : ''}`} onSubmit={handleFormSubmit}>
         <h4 className="app-page-form-label">{isEditMode ? `Edycja projektu #${id}` : "Nowy projekt"}</h4>

         <div className="app-page-form-input-wrapper app-page-form-full-width-input-wrapper">
            {!isOnlyFieldsMode === true && <label htmlFor="AddProjectName" className="required-label">Tytuł</label>}
            <TextField
               label={isOnlyFieldsMode === true ? "Tytuł" : undefined}
               id="AddProjectName" name="AddProjectName" className='app-page-form-input'
               value={localProjectForm.name}
               error={!!validationErrors.name}
               placeholder="Wprowadź tytuł projektu"
               onChange={(e) => handleInputChange("name", e.target.value)}
               type="text"
            />
            <small className="p-error app-form-helper-text">{validationErrors.name}</small>
         </div>
         <div className="app-page-form-input-wrapper app-page-form-full-width-input-wrapper">
            {!isOnlyFieldsMode === true && <label htmlFor="AddProjectName" className="required-label">Opis</label>}
            <TextareaAutosize
               maxRows={5}
               id="AddProjectDescription" name="AddProjectDescription"
               placeholder="Dodaj opis"
               className="projects-form-description-textarea-input"
               value={localProjectForm.description}
               onChange={(e) => handleInputChange('description', e.target.value)}
            />
            <small className="p-error app-form-helper-text">{validationErrors.description}</small>
         </div>
         {
            (appManagersUsers !== undefined && currentUserRole === SystemRoles.ADMIN && !isEditMode) && (
               <div className="app-page-form-input-wrapper">
                  {!isOnlyFieldsMode === true && <label htmlFor="AddProjectOwnerId" className="required-label">Właściciel projektu</label>}
                  <AsyncAutocomplete
                     id="AddProjectOwnerId"
                     sx={{ minWidth: 150 }}
                     openOnFocus handleHomeEndKeys
                     value={appManagersUsers.find(user => user.id === localProjectForm.owner_id) || undefined}
                     onChange={(e, newValue: IAllUsersNamesResponse) => handleInputChange('owner_id',newValue ? newValue.id : null)}
                     fetchOptions={() => settingsService.fetchAllUsersNamesByType(SystemRoles.MANAGER)}
                     getOptionLabel={(option: IAllUsersNamesResponse) => option.user}
                     isOptionEqualToValue={(opt: any, val: any) => opt.id === val.id}
                     classes={{ root: 'app-page-form-input'}}
                     renderInput={(params) => <TextField {...params} label={isOnlyFieldsMode === true ? "Wybierz właściciela projektu" : undefined} />}
                  />
                  <small className="p-error app-form-helper-text">{validationErrors.owner_id}</small>
               </div>
            )
         }
         {
            isEditMode && (
               <div className="app-page-form-input-wrapper">
                  {!isOnlyFieldsMode === true && <label htmlFor="AddProjectParticipants">Uczestnicy projektu</label>}
                  <AsyncAutocomplete
                     id="AddProjectParticipants"
                     multiple
                     limitTags={3}
                     value={appAllUsersNames.filter(user => localProjectForm.participants?.includes(user.id))}
                     onChange={(e, newValue: IAllUsersNamesResponse[]) => handleInputChange('participants', newValue.map(user => user.id))}
                     fetchOptions={() => settingsService.fetchAllUsersNamesByType(SystemRoles.EMPLOYEE)}
                     getOptionLabel={(option: IAllUsersNamesResponse) => option.user}
                     isOptionEqualToValue={(opt: any, val: any) => opt.id === val.id}
                     renderInput={(params) => <TextField {...params} label="Uczestnicy projektu" />}
                  />
                  <small className="p-error app-form-helper-text">{validationErrors.participants}</small>
               </div>
            )
         }
         {
            isEditMode && (
               <div className="app-page-form-input-wrapper">
                  {!isOnlyFieldsMode === true && <label htmlFor="AddProjectAssignedTasks">Przypisane zadania</label>}
                  <AsyncAutocomplete
                     id="AddProjectAssignedTasks"
                     sx={{ minWidth: 150 }}
                     multiple limitTags={3}
                     fetchOptions={() => settingsService.fetchAllTasksInfo()}
                     value={allTasksInfoArray.filter(task => localProjectForm.assignedTasks?.includes(task.id )) || undefined}
                     getOptionLabel={(option: IFetchTaskInfoResponse) => option.label}
                     isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                     onChange={(e, newValue: IFetchTaskInfoResponse[]) => handleInputChange('assignedTasks', newValue.map(task => task.id))}
                     openOnFocus	handleHomeEndKeys
                     classes={{ root: 'app-page-form-input', inputRoot: 'app-page-form-multiselect-input', tag: 'app-page-form-multiselect-input-tag'}}
                     renderInput={(params) => (<TextField {...params}  label={isOnlyFieldsMode === true ? "Przypisane zadania" : undefined} />)}
                  />
                  <small className="p-error app-form-helper-text">{validationErrors.assignedTasks}</small>
               </div>
            )
         }
         <div className="app-page-form-input-wrapper">
               {!isOnlyFieldsMode === true && <label htmlFor="AddProjectStatus" className="required-label">Status projektu</label>}
                  <Autocomplete
                     id="AddProjectStatus"
                     sx={{ minWidth: 150 }}
                     value={localProjectForm.status}
                     onChange={(e, newValue) => handleInputChange('status', newValue)}
                     openOnFocus	handleHomeEndKeys
                     options={appProjectStatuses}
                     classes={{ root: 'app-page-form-input'}}
                     renderInput={(params) => (<TextField {...params} label={isOnlyFieldsMode === true ? "Wybierz status projektu" : undefined} />)} 
                  />
              <small className="p-error app-form-helper-text">{validationErrors.status}</small>
         </div>
         <div className="app-page-form-two-column-input-wrapper">
            <div className="app-page-form-input-wrapper">
            {!isOnlyFieldsMode === true && <label htmlFor="AddProjectStartingDate" className="required-label">Data rozpoczęcia</label>}
               <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale='pl'>
                  <DatePicker
                     slotProps={{ textField: { id: "AddProjectStartingDate" } }}
                     format={Environment.dateFormatToDisplay}
                     sx={{ width: '100%', minWidth: 150 }}
                     label={isOnlyFieldsMode === true ? "Data rozpoczęcia" : undefined}
                     value={localProjectForm.start_date ? DateTime.fromFormat(localProjectForm.start_date, Environment.dateFormatToDisplay) : null}
                     onChange={(selectedDateTimeObject: DateTime | null) => selectedDateTimeObject !== null && handleInputChange("start_date", selectedDateTimeObject.toFormat(Environment.dateFormatToDisplay))}
                  />
                  </LocalizationProvider>
                  <small className="p-error app-form-helper-text">{validationErrors.start_date}</small>
               </div>

               <div className="app-page-form-input-wrapper">
                  {!isOnlyFieldsMode === true && <label htmlFor="AddProjectEndDate" className="required-label">Data zakończenia</label>}
                  <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale='pl'>
                     <DatePicker
                        slotProps={{ textField: { id: "AddProjectEndDate" } }}
                        format={Environment.dateFormatToDisplay}
                        sx={{ width: '100%', minWidth: 150 }}
                        label={isOnlyFieldsMode === true ? "Data zakończenia" : undefined}
                        value={localProjectForm.end_date ? DateTime.fromFormat(localProjectForm.end_date, Environment.dateFormatToDisplay) : null}
                        onChange={(selectedDateTimeObject: DateTime | null) => selectedDateTimeObject !== null && handleInputChange("end_date", selectedDateTimeObject.toFormat(Environment.dateFormatToDisplay))}
                     />
                  </LocalizationProvider>
                  <small className="p-error app-form-helper-text">{validationErrors.end_date}</small>
               </div>   
         </div>

         <Button className="app-page-form-submit-button" variant="contained" type="submit">
            {isEditMode? "Zapisz zmiany" : "Dodaj projekt"}
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

export default ProjectForm