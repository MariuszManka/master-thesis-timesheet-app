import { configureStore } from '@reduxjs/toolkit'
import { SessionStorage } from '../common/CookieStorage'
import { SLICE_KEYS } from './SliceKeys'
import { AppStorage } from 'common/AppStograge'
import currentUserState, { initialCurrentUserState } from './CurrentUserSlice/CurrentUserSlice'
import adminPanelState, { initialAdminPanelState } from './admin/AdminPanelSlice/AdminPanelSlice'
import applicationState, { initialApplicationState } from './ApplicationSlice/ApplicationSlice'
import tasksState, { initialTasksState } from './TasksSlice/TasksSlice'


export const saveCurrentState = (state : AppState) => {
  const appStorage = new AppStorage();
  const sessionStorage = new SessionStorage();
  appStorage.clearLocalStorage()
  

  if(appStorage.userHasSession()){
    const applicationState = JSON.stringify(state.applicationState)
    sessionStorage.add(SLICE_KEYS.APPLICATION_SLICE, applicationState)

    const currentUserState = JSON.stringify(state.currentUserState)
    sessionStorage.add(SLICE_KEYS.CURRENT_USER_SLICE, currentUserState)

    const currentAdminPanelState = JSON.stringify(state.adminPanelState)
    sessionStorage.add(SLICE_KEYS.ADMIN_PANEL_SLICE, currentAdminPanelState)
    
    const tasksState = JSON.stringify(state.tasksState)
    sessionStorage.add(SLICE_KEYS.TASKS_SLICE, tasksState)
  }
}

const loadState = () => {
  const appStorage = new AppStorage()

  //TODO PRZEMYŚLEĆ KTÓRE W SESSION STORAGE KTÓRE W APP STORAGE
  const applicationState = getSessionState(SLICE_KEYS.APPLICATION_SLICE, initialApplicationState)
  const currentUserState = getSessionState(SLICE_KEYS.CURRENT_USER_SLICE, initialCurrentUserState)
  const adminPanelState = getSessionState(SLICE_KEYS.ADMIN_PANEL_SLICE, initialAdminPanelState)
  const tasksState = getSessionState(SLICE_KEYS.TASKS_SLICE, initialTasksState)


  return {
    applicationState,
    currentUserState,
    adminPanelState,
    tasksState
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
      applicationState,
      adminPanelState,
      currentUserState,
      tasksState,
  },
  preloadedState: loadState(),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch