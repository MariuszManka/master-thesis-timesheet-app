import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { SLICE_KEYS } from '../SliceKeys'
import { IAllTasksSubjectModel } from 'services/TasksService/TasksService'
import { ICurrentTableSettings } from 'models/TablesModels'
import { Environment } from 'environment/AppSettings'
import { ITimesheetInTaskModel } from 'services/TimesheetService/TimesheetService'

export interface ITimesheetForm {
   activityDate: string;
   timeSpentInHours: number | undefined;
   activityType: string;
   taskDescription: string;
   assignedTaskId: number | undefined;
}

export interface ISingleTimesheetTableEntry {
   key: string;
   data: {
     id: string | number;
     taskDescription: string;
     creatorFullName: string;
     timeSpentInHours: string;
     activityDate: string;
     activityType: string;
     isCurrentUserTimesheet: boolean;
   }
   children?: ISingleTimesheetTableEntry[];
}

export const defaultTimesheetFormObject: ITimesheetForm = {
   activityDate: '',
   timeSpentInHours: undefined,
   activityType: '',
   taskDescription: '',
   assignedTaskId: undefined,
}

export interface ITimesheetState {
   timesheetForm: ITimesheetForm;
   allUserTimesheets: ISingleTimesheetTableEntry[] | undefined;
   currentTaskTimesheet: ITimesheetInTaskModel[] | undefined;
   currentTimesheetTableSettings: ICurrentTableSettings;
   currentTaskTimesheetTableSettings: ICurrentTableSettings;
}


export const initialTimesheetState: ITimesheetState = {
   timesheetForm: defaultTimesheetFormObject,
   allUserTimesheets: undefined,
   currentTaskTimesheet: undefined,
   currentTimesheetTableSettings: { offset: 0, limit: 10, selectedUserObject: undefined },
   currentTaskTimesheetTableSettings: { offset: 0, limit: 5, selectedUserObject: undefined }
}


export const timesheetSlice = createSlice({
   name: SLICE_KEYS.TIMESHEET_SLICE,
   initialState: initialTimesheetState,
   reducers: {
      setAllTimesheets: (state, action: PayloadAction<ISingleTimesheetTableEntry[]>) => {
         state.allUserTimesheets = action.payload
      },
      setTaskTimesheet: (state, action: PayloadAction<ITimesheetInTaskModel[]>) => {
         state.currentTaskTimesheet = action.payload
      },
      setCurrentTimesheetTableSettings: (state, action: PayloadAction<ICurrentTableSettings>) => {
         state.currentTimesheetTableSettings = action.payload
      },
      setCurrentTaskTimesheetTableSettings: (state, action: PayloadAction<ICurrentTableSettings>) => {
         state.currentTimesheetTableSettings = action.payload
      },
      // setTimesheetFormValues: (state, action: PayloadAction<Partial<ITimesheetForm>>) => {
      //    state.timesheetForm = { ...state.timesheetForm, ...action.payload }
      // },
      // resetTimesheetForm: (state) => {
      //    state.timesheetForm = defaultTimesheetFormObject
      // }
   }  
 })
 
 // Action creators are generated for each case reducer function
 export const { setAllTimesheets, setTaskTimesheet, setCurrentTimesheetTableSettings, setCurrentTaskTimesheetTableSettings} = timesheetSlice.actions
 
 export default timesheetSlice.reducer