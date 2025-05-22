import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { SLICE_KEYS } from '../SliceKeys'
import { ITaskResponseModel } from 'services/TasksService/TasksService'
import { IAllUsersNamesResponse } from 'services/SettingsService/SettingsService'
import { ICurrentTableSettings } from 'models/TablesModels'
import { Environment } from 'environment/AppSettings'


export interface ITaskForm {
   project_id: number | null;
   subject: string;
   description: string;
   descriptionInHTMLFormat: string;
   taskType?: string;
   taskStatus?: string;
   priority?: string;
   startingDate: string | null;
   createdDate: string | null;
   lastUpdateDateTime: string | null;
   dueDate: string | null;
   parentTaskId?: number | null;
   parentTask: ITaskResponseModel | null;
   estimatedHours?: number | null;
   assignedUsers: IAllUsersNamesResponse[];
}

export interface ITasksState {
   allTasks: ITaskResponseModel[];
   taskForm: ITaskForm;
   currentTableSettings: ICurrentTableSettings;
   currentSelectedTaskForPreview?: ITaskResponseModel;
}

export const defaultTaskFormObject: ITaskForm = {
   project_id: null,
   subject: '',
   description: '',
   descriptionInHTMLFormat: '',
   taskType: undefined,
   taskStatus: undefined,
   priority: undefined,
   startingDate: null,
   createdDate: null,
   lastUpdateDateTime: null,
   dueDate: null,
   parentTaskId: undefined,
   parentTask: null,
   estimatedHours: undefined,

   assignedUsers: [],
}

export const initialTasksState: ITasksState = {
   allTasks: [],
   taskForm: defaultTaskFormObject,
   currentSelectedTaskForPreview: undefined,
   currentTableSettings: { offset: 0, limit: Environment.defaultRowsPerTablePage, selectedUserObject: undefined, selectedProjectObject: undefined },
}


export const tasksSlice = createSlice({
   name: SLICE_KEYS.TASKS_SLICE,
   initialState: initialTasksState,
   reducers: {
      setAllTasks: (state, action: PayloadAction<ITaskResponseModel[]>) => {
         state.allTasks = action.payload
      },
      setCurrentAllTasksTableSettings: (state, action: PayloadAction<ICurrentTableSettings>) => {
         state.currentTableSettings = action.payload
      },
      setTaskFormValues: (state, action: PayloadAction<Partial<ITaskForm>>) => {
         state.taskForm = { ...state.taskForm, ...action.payload }
      },
      setCurrentSelectedTaskForPreview:  (state, action: PayloadAction<ITaskResponseModel>) => {
         state.currentSelectedTaskForPreview = action.payload;
      },
      clearCurrentSelectedTaskForPreview: (state) => {
         state.currentSelectedTaskForPreview = undefined
      },
      resetTaskForm: (state) => {
         state.taskForm = defaultTaskFormObject
      }
   }  
 })
 
 // Action creators are generated for each case reducer function
 export const { setAllTasks, setTaskFormValues, resetTaskForm, setCurrentAllTasksTableSettings, setCurrentSelectedTaskForPreview, clearCurrentSelectedTaskForPreview } = tasksSlice.actions
 
 export default tasksSlice.reducer