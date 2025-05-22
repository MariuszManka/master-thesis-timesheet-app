import { HttpClient } from 'common/HttpClient'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'


// ========================================== INTERFACES ==========================================
   export interface IFetchCurrentAppConfig {
      appProjectStatuses: string[];
      appTaskTypes: string[];
      appTaskStatuses: string[];
      appTaskPriority: string[];
      appTimesheetActivityTypes: string[];
      appDatabaseDateFormatForFront: string;
   }

   export interface IFetchTaskInfoResponse {
      id: number;
      label: string;
   }

   export interface IAllUsersNamesResponse {
      id: number;
      user: string;
   }
// ================================================================================================


//#region SettingService Instance
let instance: SettingsService
//#endregion


export class SettingsService {
    private readonly _client: HttpClient;
    private readonly _settingsUrlPath = "/settings";
    private readonly _fetchAllTasksInfoUrlPath = "/settings/tasks-info";
    private readonly _fetchAllUsersNames = "/settings/all-users-names";
    private readonly _fetchAllUsersNamesByType = "/settings/all-users-names-by-types";
  
    constructor() {
        if (instance) { //SINGLETON DESIGN PATTERN
           throw new Error("New instance cannot be created!!");
        }
     
        instance = this;
        this._client = new HttpClient();
    }

   public async fetchCurrentAppConfig() : Promise<IFetchCurrentAppConfig> {
      return (await this._client.get<IFetchCurrentAppConfig>(this._settingsUrlPath, true)).data;
   }

   public async fetchAllTasksInfo() : Promise<IFetchTaskInfoResponse[]> {
      return (await this._client.get<IFetchTaskInfoResponse[]>(this._fetchAllTasksInfoUrlPath, true)).data;
   }

   public async fetchAllUsersNames() : Promise<IAllUsersNamesResponse[]> {
      return (await this._client.get<IAllUsersNamesResponse[]>(this._fetchAllUsersNames, true)).data;
   }

   public async fetchAllUsersNamesByType(userType: SystemRoles) : Promise<IAllUsersNamesResponse[]> {
      const params = new URLSearchParams();
      params.append("user_type", userType);

      const fetchAllUsersNamesByTypeUrlWithParams = `${this._fetchAllUsersNamesByType}?${params.toString()}`;
      
      return (await this._client.get<IAllUsersNamesResponse[]>(fetchAllUsersNamesByTypeUrlWithParams, true)).data;
   }
}

let settingsService = Object.freeze(new SettingsService())//SINGLETON DESIGN PATTERN
export default settingsService;