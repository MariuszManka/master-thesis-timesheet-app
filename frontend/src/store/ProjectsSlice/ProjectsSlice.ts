import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_KEYS } from '../SliceKeys'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'
import { ISingleUserDataModel } from 'store/admin/AdminPanelSlice/AdminPanelSlice'
import { IProjectsResponse } from 'services/ProjectsService/ProjectsService'


export interface IProjectForm {
   name: string;
   description: string;
   start_date: string;
   end_date: string;
   status: string;
   owner_id: number | null;

   participants?: number[];
   assignedTasks?: number[];
}

export const defaultProjectFormObject: IProjectForm = {
   name: '',
   description: '',
   start_date: '',
   end_date: '',
   status: '',
   owner_id: null,
}
  
export interface IProjectsState {
   currentUserProjects: IProjectsResponse[]
   projectForm: IProjectForm
}


export const initialProjectsState: IProjectsState = {
   currentUserProjects: [],
   projectForm: defaultProjectFormObject,
}




export const currentProjectsSlice = createSlice({
   name: SLICE_KEYS.PROJECTS_SLICE,
   initialState: initialProjectsState,
   reducers: {
      setCurrentUserProjects: (state, action: PayloadAction<IProjectsResponse[]>) => {
         state.currentUserProjects = action.payload
      },
      setProjectFormValues: (state, action: PayloadAction<Partial<IProjectForm>>) => {
         state.projectForm = { ...state.projectForm, ...action.payload }
      },
      resetProjectForm: (state) => {
         state.projectForm = defaultProjectFormObject
      }
   }  
 })
 
 // Action creators are generated for each case reducer function
 export const { setCurrentUserProjects, setProjectFormValues, resetProjectForm } = currentProjectsSlice.actions
 
 export default currentProjectsSlice.reducer