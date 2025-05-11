import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_KEYS } from '../SliceKeys'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'
import { ISingleUserDataModel } from 'store/admin/AdminPanelSlice/AdminPanelSlice'
import { IProjectsResponse } from 'services/ProjectsService/ProjectsService'


export interface IProjectsState {
   currentUserProjects: IProjectsResponse[]
}


export const initialProjectsState: IProjectsState = {
   currentUserProjects: []
}




export const currentProjectsSlice = createSlice({
   name: SLICE_KEYS.PROJECTS_SLICE,
   initialState: initialProjectsState,
   reducers: {
      setCurrentUserProjects: (state, action: PayloadAction<IProjectsResponse[]>) => {
         state.currentUserProjects = action.payload
      },
   }  
 })
 
 // Action creators are generated for each case reducer function
 export const { setCurrentUserProjects } = currentProjectsSlice.actions
 
 export default currentProjectsSlice.reducer