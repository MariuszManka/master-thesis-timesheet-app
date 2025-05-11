import { HttpClient } from 'common/HttpClient'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'
import { ITaskResponseModel } from 'services/TasksService/TasksService'
import { IUserInfoModel } from 'store/admin/AdminPanelSlice/AdminPanelSlice'


// ========================================== INTERFACES ==========================================
   export interface IAllProjectsSubjectsModel {
      id: number;
      subject: string;
   }

   export interface IProjectsResponse {
      id: number;
      owner_id: number;
      owner_full_name: string;
      name: string;
      description: string;
      total_time_spent: number;
      start_date: string;
      end_date: string;
      status: string;
      created_date: string;
      tasks: ITaskResponseModel[];
      owner: IUserProjectParticipantModel;
      participants: IUserProjectParticipantModel[];
   }

   export interface IUserProjectParticipantModel {
      id: number;
      email: string;
      active: boolean;
      role: SystemRoles;
      user_info: IUserInfoModel;
   }
// ================================================================================================


//#region SettingService Instance
let instance: ProjectsService
//#endregion


export class ProjectsService {
    private readonly _client: HttpClient;
    private readonly _fetchAllProjectsSubjectsUrlPath = "/projects/get-all-projects-subjects"
    private readonly _fetchAllUserProjectsUrlPath = "/projects/get-all-user-projects"
    
    constructor() {
        if (instance) { //SINGLETON DESIGN PATTERN
           throw new Error("New instance cannot be created!!");
        }
     
        instance = this;
        this._client = new HttpClient();
    }

   public async fetchAllProjectsSubjectsList(): Promise<IAllProjectsSubjectsModel[]> {
      return (await this._client.get<IAllProjectsSubjectsModel[]>(
         this._fetchAllProjectsSubjectsUrlPath,
         true
      )).data
   }

   public async fetchAllUserProjectsList(): Promise<IProjectsResponse[]> {
      return (await this._client.get<IProjectsResponse[]>(
         this._fetchAllUserProjectsUrlPath,
         true
      )).data
   }
}

let projectsService = Object.freeze(new ProjectsService())//SINGLETON DESIGN PATTERN
export default projectsService;