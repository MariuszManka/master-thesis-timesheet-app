import { configureStore } from '@reduxjs/toolkit'
import { SessionStorage } from '../common/CookieStorage'
import { SLICE_KEYS } from './SliceKeys'
import { AppStorage } from 'common/AppStograge'
import currentUserState, { initialCurrentUserState } from './CurrentUserSlice/CurrentUserSlice'
import adminPanelState, { initialAdminPanelState } from './admin/AdminPanelSlice/AdminPanelSlice'


export const saveCurrentState = (state : AppState) => {
  const appStorage = new AppStorage();
  const sessionStorage = new SessionStorage();
  appStorage.clearLocalStorage()
  

  if(appStorage.userHasSession()){
    const currentUserState = JSON.stringify(state.currentUserState)
    appStorage.setItem(SLICE_KEYS.CURRENT_USER_STATE, currentUserState)

    const currentAdminPanelState = JSON.stringify(state.adminPanelState)
    appStorage.setItem(SLICE_KEYS.ADMIN_PANEL_SLICE, currentAdminPanelState)
  }
}

const loadState = () => {
  const appStorage = new AppStorage()
  const currentUserState = getState(SLICE_KEYS.CURRENT_USER_STATE, appStorage, initialCurrentUserState)
  const adminPanelState = getState(SLICE_KEYS.ADMIN_PANEL_SLICE, appStorage, initialAdminPanelState)

//   const applicationState = getState(SLICE_KEYS.APPLICATION_SLICE, appStorage, initialApplicationState)
//   const globalConfigurationState = getSessionState(SLICE_KEYS.GLOBAL_CONFIGURATION_SLICE, initialGlobalConfigurationState)


  return {
   currentUserState,
   adminPanelState,
  }
}

const getState = <T>(key: string, storage: AppStorage, initialState: T): T => {
  if(storage.isKeyExists(key) && storage.userHasSession()){
    const stateJson = storage.getItem(key)
    const result = JSON.parse(stateJson)
    return result as unknown as T
  }

  return initialState as T
}

const getSessionState = <T>(key: string, initialState: T) => {
  const sessionStorage = new SessionStorage()
  const stateJson = sessionStorage.get(key)
  let state = initialState

  if(stateJson != null && stateJson){
    state = JSON.parse(stateJson)
  }

  return state
}

export const store = configureStore({
  reducer: {
      adminPanelState,
      currentUserState,
  },
  preloadedState: loadState(),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch