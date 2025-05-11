import { Autocomplete, Box, Breadcrumbs, Button, CircularProgress, InputLabel, Link, TextareaAutosize, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { Column } from 'primereact/column'
import { TreeTable } from 'primereact/treetable'
import React, { Dispatch, useCallback, useEffect, useMemo, useState } from 'react';
import tasksService, { IAllTasksSubjectModel } from 'services/TasksService/TasksService'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from 'store'
import { DateTime } from 'luxon'
import { initialTimesheetState, ISingleTimesheetTableEntry, ITimesheetForm, setAllTimesheets } from 'store/TimesheetSlice/TimesheetSlice'
import { Environment } from 'environment/AppSettings'
import * as Yup from 'yup'


import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import SendIcon from '@mui/icons-material/Send';
import './TimesheetStyles.scss'
import { Fieldset } from 'primereact/fieldset'
import { isDateValid } from 'common/helpers/yupValidationsHelpers'
import timesheetService, { ICreateTimesheetData } from 'services/TimesheetService/TimesheetService'
import { useSnackbar } from 'notistack'
import { TimePicker } from '@mui/x-date-pickers'
import TimesheetTable from 'components/Tables/TimesheetTable/TimesheetTable/TimesheetTable'
import { ITimesheetFormProps } from './TimesheetPageProps'
import { AppLinks } from 'common/AppLinks'



export enum CURRENT_TIMESHEET_MODE {
   USER = "USER",
   TEAM = "TEAM"
} 


 const AddTimesheetForm = (props: ITimesheetFormProps) => {
  const { enqueueSnackbar } = useSnackbar()
  const dispatch = useDispatch()

  const { appTimesheetActivityTypes, appDatabaseDateFormatForFront } = useSelector((state: AppState) => state.applicationState)

  const [open, setOpen] = React.useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [options, setOptions] = React.useState<readonly IAllTasksSubjectModel[]>([])
  const [loading, setLoading] = React.useState(false)
  const [localTimesheetForm, setLocalTimesheetForm] = useState<ITimesheetForm>(initialTimesheetState.timesheetForm)
  const { setIsTimesheetTableLoading, currentTimesheetMode, currentUserId} = props

  const floatToDateTime = useCallback((floatTime: number | undefined): DateTime | undefined => {
      if(floatTime === undefined) {
        return undefined
      }

      const hours = Math.floor(floatTime);
      const minutes = Math.round((floatTime % 1) * 100); // base-100 decimal
    
      return DateTime.now().set({ hour: hours, minute: minutes });
    }, [])

     // Validation Schema
    const addTimesheetYupValidationSchema = useMemo(
      () =>
          Yup.object().shape({
            taskDescription: Yup.string().required("Uzupełnij pole"),
            timeSpentInHours: Yup.number().required("Uzupełnij pole"),
            activityDate: Yup.string().required("Uzupełnij pole").test(isDateValid),
            assignedTaskId: Yup.number().required("Uzupełnij pole"),
            activityType: Yup.string().required("Uzupełnij pole"),
          }),
      []
    )
  
    // Input Handlers
    const handleInputChange = useCallback((field: string, value: any) => {
        setLocalTimesheetForm((prev) => ({ ...prev, [field]: value }))
    }, [])

    useEffect(() => {
      (async() => {
        const subjects = await tasksService.fetchAllTasksSubjectsList()
        setOptions([...subjects])
      })()
    }, [])

  const handleOpen = () => {
    setOpen(true);
    (async () => {
      setLoading(true)
      const subjects = await tasksService.fetchAllTasksSubjectsList()
      setLoading(false)

      setOptions([...subjects])
    })()
  }

  const handleClose = (e: any) => {
    setOptions([])
    setOpen(false)
  }

  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await addTimesheetYupValidationSchema.validate(localTimesheetForm, { abortEarly: false })
  
      const createTimesheetEntryData: ICreateTimesheetData = {
        ...localTimesheetForm, 
        timeSpentInHours: localTimesheetForm.timeSpentInHours as number,
        activityDate: DateTime.fromFormat(localTimesheetForm.activityDate as string, Environment.dateFormatToDisplay).toFormat(appDatabaseDateFormatForFront),
        assignedTaskId: localTimesheetForm.assignedTaskId as number
      }
      
      await timesheetService.createTimesheetEntry(createTimesheetEntryData)

      setIsTimesheetTableLoading(true)
      
      const timesheetResponse = currentTimesheetMode === CURRENT_TIMESHEET_MODE.USER ? 
                await timesheetService.getCurrentUserTimesheets(0, Environment.defaultRowsPerTablePage,) :
                await timesheetService.getCurrentTeamTimesheets(0, Environment.defaultRowsPerTablePage,)


      dispatch(setAllTimesheets(timesheetResponse.tree))
      enqueueSnackbar("Poprawnie dodano nowy wpis!", { variant: 'success', autoHideDuration: 5000 })
      setLocalTimesheetForm(initialTimesheetState.timesheetForm)
      setValidationErrors({})
    }
    catch (error: any) {
      if (error.inner) {
        const errors: Record<string, string> = {}
        error.inner.forEach((err: any) => (errors[err.path] = err.message))
        setValidationErrors(errors)
     }
    }
    finally {
      setIsTimesheetTableLoading(false)
    }
  }, [localTimesheetForm, currentTimesheetMode])


  return (
    <Fieldset legend="Dodaj wpis" className='timesheet-add-timesheet-form-outer-wrapper' toggleable collapsed>
      <form onSubmit={handleFormSubmit}>
        <div style={{gridArea: 'timesheet-task'}}>
          <Autocomplete
            sx={{ minWidth: 150 }}
            open={open}
            disableClearable
            classes={{ paper: "timesheet-select-task-dropdown" }}
            onOpen={handleOpen}
            onClose={handleClose}
            onChange={(e, newValue) => handleInputChange('assignedTaskId', newValue.id)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.subject}
            options={options}
            loading={loading}
            noOptionsText="Brak wyników"
            renderOption={(props, option) => {
              const { key, id, ...optionProps } = props;

              return (
                <Box component="li" key={`${key}-${id}`} {...optionProps} >
                  {
                    option.associatedUserIds.includes(currentUserId) ? 
                    <PersonOutlineOutlinedIcon style={{ width: 17, marginLeft: -5, marginRight: 5, marginTop: -3 }} /> : 
                    <span style={{ width: 17, marginLeft: 0 }} />
                  }
                  {`[${option.id}] ${option.subject}`}
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField 
                {...params}
                label="Zadanie"
                slotProps={{
                input: {
                  ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  },
                }}
                />
              )}
          />
          {validationErrors.assignedTaskId !== undefined ? 
            <p className='add-timesheet-form-helper-text'>{validationErrors.assignedTaskId}</p> :
            <p className='add-timesheet-form-helper-text'></p>
          }
        </div>
        
        <div style={{gridArea: 'timesheet-task-type'}}>
          <Autocomplete
            sx={{ minWidth: 150 }}
            value={localTimesheetForm.activityType}
            onChange={(e, newValue) => handleInputChange('activityType', newValue)}
            disableClearable
            openOnFocus	
            handleHomeEndKeys
            options={appTimesheetActivityTypes}
            renderInput={(params) => (<TextField {...params} label="Typ zadania" />)}
          />
          {validationErrors.activityType !== undefined ? 
            <p className='add-timesheet-form-helper-text'>{validationErrors.activityType}</p> :
            <p className='add-timesheet-form-helper-text'></p>
          }
        </div>
        <div style={{gridArea: 'timesheet-task-date'}}>
          <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale='pl'>
            <DatePicker
              format={Environment.dateFormatToDisplay}
              sx={{ width: '100%', minWidth: 150 }}
              label="Data zadania" 
              value={localTimesheetForm.activityDate ? DateTime.fromFormat(localTimesheetForm.activityDate, Environment.dateFormatToDisplay) : undefined}
              onChange={(selectedDateTimeObject: DateTime | null) => selectedDateTimeObject && handleInputChange("activityDate", selectedDateTimeObject.toFormat(Environment.dateFormatToDisplay))}         
            />
          </LocalizationProvider>
          {validationErrors.activityDate !== undefined ? 
            <p className='add-timesheet-form-helper-text'>{validationErrors.activityDate}</p> :
            <p className='add-timesheet-form-helper-text'></p>
          }
        </div>
        <div style={{gridArea: 'timesheet-task-time-spend'}}>
          <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale='pl'>
            <TimePicker
              views={['hours', 'minutes']} format="HH:mm" ampmInClock={false}
              label="Przepracowany czas" 
              maxTime={DateTime.now().set({ hour: 12 })} skipDisabled timeSteps={{ hours: 1, minutes: 10 }}
              sx={{ minWidth: 150, width: '100%' }} 
              value={floatToDateTime(localTimesheetForm.timeSpentInHours)}
              onAccept={(selectedDateTimeObject: DateTime | null) => handleInputChange('timeSpentInHours', parseFloat(`${selectedDateTimeObject?.hour}.${selectedDateTimeObject?.minute}`))}
              onChange={(selectedDateTimeObject, event) => {
                if(selectedDateTimeObject?.isValid){
                  handleInputChange('timeSpentInHours', parseFloat(`${selectedDateTimeObject?.hour}.${selectedDateTimeObject?.minute}`))
                }
                else {
                  handleInputChange('timeSpentInHours', undefined)
                }
              }}
            />
          </LocalizationProvider>
          {validationErrors.timeSpentInHours !== undefined ? 
            <p className='add-timesheet-form-helper-text'>{validationErrors.timeSpentInHours}</p> :
            <p className='add-timesheet-form-helper-text'></p>
          }
        </div>
        <div style={{ gridArea: 'timesheet-task-description' }}>
          <textarea
              placeholder="Dodaj komentarz"
              className="timesheet-task-description-input"
              value={localTimesheetForm.taskDescription}
              onChange={(e) => handleInputChange('taskDescription', e.target.value)}
          />
          {validationErrors.taskDescription !== undefined ? 
            <p className='add-timesheet-form-helper-text'>{validationErrors.taskDescription}</p> :
            <p className='add-timesheet-form-helper-text'></p>
          }
        </div>
        <Button className="app-page-form-submit-button timesheet-submit-button" variant="contained" type="submit" endIcon={<SendIcon />}>
          Dodaj wpis
        </Button>
      </form>
    </Fieldset>
  )
}


const TimesheetPageContent = ({ currentUserId }: { currentUserId: number }) => { 
    const [currentTimesheetMode, setCurrentTimesheetMode] = useState<CURRENT_TIMESHEET_MODE>(CURRENT_TIMESHEET_MODE.USER)
    const [isLoading, setIsLoading] = useState(false)
  
    return (
      <>
        <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.timesheet} underline="hover" color='inherit'>Timesheet</Link>
         </Breadcrumbs>
        <AddTimesheetForm currentUserId={currentUserId} currentTimesheetMode={currentTimesheetMode} setIsTimesheetTableLoading={setIsLoading} />
        <TimesheetTable currentTimesheetMode={currentTimesheetMode} setCurrentTimesheetMode={setCurrentTimesheetMode} isLoading={isLoading} setIsLoading={setIsLoading} />
      </>
    )
}


const TimesheetPage = () => {
  const currentUserId = useSelector((state: AppState) => state.currentUserState.id)

   return (
      <div className='timesheet-page-outer-wrapper'>
        <header className='timesheet-page-header-wrapper'>
          <PendingActionsRoundedIcon />
          <h1>Timesheet</h1>
        </header>
        <section className='timesheet-page-content-section-outer-wrapper'>
          <TimesheetPageContent currentUserId={currentUserId} />
        </section>
      </div>
   )
}

export default TimesheetPage