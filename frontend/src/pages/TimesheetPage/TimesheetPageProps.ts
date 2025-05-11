import { Dispatch } from 'react'
import { CURRENT_TIMESHEET_MODE } from './TimesheetPage'

export interface ITimesheetFormProps {
   currentUserId: number; 
   currentTimesheetMode: CURRENT_TIMESHEET_MODE;
   setIsTimesheetTableLoading: Dispatch<boolean>;
}