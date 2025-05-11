import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { SLICE_KEYS } from '../../SliceKeys'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'
import { ITaskForm } from 'store/TasksSlice/TasksSlice'


export interface IUserPreferencesModel {
   id: number;
   theme: string
}

export interface IUserAddressesFormDataModel {
   formal: IUserAddressesModel;
   correspondence: IUserAddressesModel;
}

export interface IUserAddressesModel {
   id: number;
   address_type: "Formalny" | "Korespondencyjny";
   street: string;
   city: string;
   postal_code: string;
   house_number: string;
   flat_number: string;
}

export interface IUserInfoModel {
   id: number;
   full_name: string;
   position: string;
   phone: string | null;
   avatar: string | null;
}

export interface ISingleUserDataModel {
   id: number;
   email: string;
   active: boolean;
   role: SystemRoles;
   user_info: IUserInfoModel;
   user_preferences: IUserPreferencesModel | null;
   user_addresses: IUserAddressesModel[];
   associated_tasks: ITaskForm[];
}

export interface IAdminPanelState {
   allUsersList: ISingleUserDataModel[];
}

export const initialAdminPanelState: IAdminPanelState = {
   allUsersList: []
}


export const adminPanelSlice = createSlice({
   name: SLICE_KEYS.ADMIN_PANEL_SLICE,
   initialState: initialAdminPanelState,
   reducers: {
      setAllUsersList: (state, action: PayloadAction<ISingleUserDataModel[]>) => {
         state.allUsersList = action.payload
      },
   }  
 })
 
 // Action creators are generated for each case reducer function
 export const { setAllUsersList } = adminPanelSlice.actions
 
 export default adminPanelSlice.reducer