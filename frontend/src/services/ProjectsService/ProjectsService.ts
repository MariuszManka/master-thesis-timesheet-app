import { HttpClient } from 'common/HttpClient'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'
import { IOperationSuccessfulResponse } from 'models/HttpRequestModels'
import { ITaskResponseModel } from 'services/TasksService/TasksService'
import { IUserInfoModel } from 'store/admin/AdminPanelSlice/AdminPanelSlice'
import { IProjectForm } from 'store/ProjectsSlice/ProjectsSlice'


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

   export interface IUpdateCurrentProjectData {
      updatedProjectData: IProjectForm;
      currentProjectId: number;
   }
// ================================================================================================


//#region SettingService Instance
let instance: ProjectsService
//#endregion


export class ProjectsService {
    private readonly _client: HttpClient;
    private readonly _fetchAllProjectsSubjectsUrlPath = "/projects/get-all-projects-subjects"
    private readonly _fetchAllUserProjectsUrlPath = "/projects/get-all-user-projects"
    private readonly _createProjectUrlPath = "/projects/create-project"
    private readonly _updateSelectedProjectUrlPath = "/projects/update-project"
    private readonly _deleteSelectedProjectUrlPath = "/projects/delete-project"
    
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

   public async createProject(createTaskData: IProjectForm): Promise<any> { // TODO - POPRAWIĆ ZWRACANY TYP      
      return (await this._client.post<any, IProjectForm>(
        this._createProjectUrlPath, 
        createTaskData,
        true
      )).data;
   }

   public async updateSelectedProject(currentProjectUpdatedData: IUpdateCurrentProjectData): Promise<IOperationSuccessfulResponse> {
      const { currentProjectId, updatedProjectData } = currentProjectUpdatedData
      const updateCurrentProjectUrl = `${this._updateSelectedProjectUrlPath}/${currentProjectId}`

      return (await this._client.patch<IOperationSuccessfulResponse, IProjectForm>(
         updateCurrentProjectUrl, 
         updatedProjectData,
         true
      )).data
   }

   public async deleteSelectedProject(projectToDeleteId: number): Promise<IOperationSuccessfulResponse> {
      const userToDeleteUrl = `${this._deleteSelectedProjectUrlPath}/${projectToDeleteId}`
      return (await this._client.delete<IOperationSuccessfulResponse>(userToDeleteUrl, true)).data
   }
}

let projectsService = Object.freeze(new ProjectsService())//SINGLETON DESIGN PATTERN
export default projectsService;