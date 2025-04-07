import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_KEYS } from '../SliceKeys'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'
import { ISingleUserDataModel } from 'store/admin/AdminPanelSlice/AdminPanelSlice'


export interface ICurrentUserState extends Omit<ISingleUserDataModel, 'id'> {
   id: number;
}

export interface ISetCurrentUserData {
   id: number;
   email: string;
   role: SystemRoles;
}

export const initialCurrentUserState: ICurrentUserState = {
   id: 0,
   email: "",
   active: false,
   role: SystemRoles.DEFAULT,
   user_info: {
      id: 0,
      full_name: "",
      position: "",
      phone: "",
      avatar: null,
   },
   user_preferences: {
      id: 0,
      theme: "",
   },
   user_addresses: {
      id: 0,
      street: "",
   },
   associated_tasks: [],
}




export const currentUserSlice = createSlice({
   name: SLICE_KEYS.CURRENT_USER_SLICE,
   initialState: initialCurrentUserState,
   reducers: {
      setCurrentUserData: (state, action: PayloadAction<ISingleUserDataModel>) => {
         const { id, email, active, role, user_info, user_preferences, user_addresses, associated_tasks } = action.payload

         state.id = id
         state.email = email
         state.active = active
         state.role = role
         state.user_info = user_info
         state.user_preferences = user_preferences
         state.user_addresses = user_addresses
         state.associated_tasks = associated_tasks
      },
      setNewUserAvatar: (state, action: PayloadAction<string>) => {
         state.user_info.avatar = action.payload
      }
   }  
 })
 
 // Action creators are generated for each case reducer function
 export const { setCurrentUserData, setNewUserAvatar } = currentUserSlice.actions
 
 export default currentUserSlice.reducer