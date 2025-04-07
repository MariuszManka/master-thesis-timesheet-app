import { IAllUsersNamesResponse } from 'services/SettingsService/SettingsService'

export interface ITasksTableAdminMode {
   userId?: undefined;
   isAdminMode: true
}

export interface ITaskTableUserMode {
   userId: number;
   isAdminMode: false
}

export type ITasksTableProps = ITasksTableAdminMode | ITaskTableUserMode;

export interface ITasksTablePersistedState {
   currentSelectedUserForDataDisplay: IAllUsersNamesResponse[],
   isFirstRender?: boolean;
}