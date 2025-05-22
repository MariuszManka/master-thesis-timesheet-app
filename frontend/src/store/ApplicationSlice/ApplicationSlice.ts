import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_KEYS } from '../SliceKeys'
import { IAllUsersNamesResponse, IFetchCurrentAppConfig, IFetchTaskInfoResponse } from 'services/SettingsService/SettingsService'
import { IAllProjectsSubjectsModel } from 'services/ProjectsService/ProjectsService'


export interface IApplicationState {
   appProjectStatuses: string[];
   appTaskTypes: string[];
   appTaskStatuses: string[];
   appTaskPriority: string[];
   appTimesheetActivityTypes: string[];
   appDatabaseDateFormatForFront: string;
   allTasksInfoArray: IFetchTaskInfoResponse[]
   appAllUsersNames: IAllUsersNamesResponse[]
   appAllUsersNamesByType?: IAllUsersNamesResponse[]
   currentUserAllProjectsSubjects: IAllProjectsSubjectsModel[]
}

export const initialApplicationState: IApplicationState = {
   appProjectStatuses: [],
   appTaskTypes: [],
   appTaskStatuses: [],
   appTaskPriority: [],
   appTimesheetActivityTypes: [],
   appDatabaseDateFormatForFront: '',
   allTasksInfoArray: [],
   appAllUsersNames: [],
   currentUserAllProjectsSubjects: [],
}


export const applicationSlice = createSlice({
   name: SLICE_KEYS.APPLICATION_SLICE,
   initialState: initialApplicationState,
   reducers: {
      fetchCurrentAppConfig: (state, action: PayloadAction<IFetchCurrentAppConfig>) => {
         state.appProjectStatuses = action.payload.appProjectStatuses
         state.appTaskTypes = action.payload.appTaskTypes
         state.appTaskStatuses = action.payload.appTaskStatuses
         state.appTaskPriority = action.payload.appTaskPriority
         state.appTimesheetActivityTypes = action.payload.appTimesheetActivityTypes
         state.appDatabaseDateFormatForFront = action.payload.appDatabaseDateFormatForFront
      },
      fetchAllTasksInfoArray: (state, action: PayloadAction<IFetchTaskInfoResponse[]>) => {
         state.allTasksInfoArray = action.payload
      },
      fetchAllUsersNamesArray: (state, action: PayloadAction<IAllUsersNamesResponse[]>) => {
         state.appAllUsersNames = action.payload
      },
      fetchAllProjectsSubjects: (state, action: PayloadAction<IAllProjectsSubjectsModel[]>) => {
         state.currentUserAllProjectsSubjects = action.payload
      },
      fetchAllUserNamesByType: (state, action: PayloadAction<IAllUsersNamesResponse[]>) => {
         state.appAllUsersNamesByType = action.payload
      },
   }  
 })
 
 // Action creators are generated for each case reducer function
 export const { fetchCurrentAppConfig, fetchAllTasksInfoArray, fetchAllUsersNamesArray, fetchAllProjectsSubjects, fetchAllUserNamesByType } = applicationSlice.actions
 
 export default applicationSlice.reducer