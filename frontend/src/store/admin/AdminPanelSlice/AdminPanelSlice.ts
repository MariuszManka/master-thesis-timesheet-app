import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { SLICE_KEYS } from '../../SliceKeys'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'


export interface IUserPreferencesModel {
   id: number;
   theme: string
}

export interface IUserAddressesModel {
   id: number;
   street: string;
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
   user_addresses: IUserAddressesModel;
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