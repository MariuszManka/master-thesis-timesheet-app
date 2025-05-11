import { IAllProjectsSubjectsModel } from 'services/ProjectsService/ProjectsService'
import { IAllUsersNamesResponse } from 'services/SettingsService/SettingsService'

export interface ICurrentTableSettings {
   offset: number;
   limit: number;
   selectedUserObject?: IAllUsersNamesResponse;
   selectedProjectObject?: IAllProjectsSubjectsModel;
}