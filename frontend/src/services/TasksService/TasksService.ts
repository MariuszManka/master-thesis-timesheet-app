import { HttpClient } from 'common/HttpClient'
import { IOperationSuccessfulResponse } from 'models/HttpRequestModels'
import { IAllUsersNamesResponse } from 'services/SettingsService/SettingsService'
import { ITimesheetInTaskModel } from 'services/TimesheetService/TimesheetService'


// ========================================== INTERFACES ==========================================
   export interface ICreateTaskData {
      project_id: number;
      subject: string;
      description: string;
      descriptionInHTMLFormat: string;
      taskType?: string;
      taskStatus?: string;
      priority?: string;
      startingDate: string;
      dueDate?: string;
      estimatedHours?: number;
      parentTaskId?: number;
      assignedUsers: number[];
   }

   export interface ITaskCommentModel {
      id: number;
      task_id: number;
      creator_id: number;
      creator_full_name: string;
      creator_avatar?: string;
      commentContent: string;
      createdDateTime: string;
      lastUpdateDateTime: string;
   }

   export interface ITaskResponseModel {
      id: number;
      project_id: number;
      projectName: string | null;
      subject: string;
      description: string;
      descriptionInHTMLFormat: string;
      total_time_spent_in_hours?: number;
      taskType?: string;
      taskStatus?: string;
      priority?: string;
      startingDate: string;
      dueDate?: string;
      estimatedHours?: number;
      parentTaskId?: number;
      parentTask?: ITaskResponseModel | null;
      timesheets?: ITimesheetInTaskModel[];
      assignedUsers: IAllUsersNamesResponse[];
      comments: ITaskCommentModel[];
   }

   export interface IAllTasksSubjectModel {
      id: number;
      subject: string;
      associatedUserIds: number[];
   }

   export interface IUpdateCurrentTaskData {
      updatedTaskData: ICreateTaskData;
      currentTaskId: number;
   }

   export interface IUpdateSingleTaskCommentData {
      new_comment_content: string;
      comment_to_update_id: number;
   }

   export interface IAddNewTaskComment {
      task_id: number;
      commentContent: string
   }
// ================================================================================================


//#region SettingService Instance
let instance: TasksService
//#endregion


export class TasksService {
    private readonly _client: HttpClient;
    private readonly _fetchAllTasksListUrlPath = "/tasks/get-all-tasks-list"
    private readonly _fetchSingleTaskUrlPath = "/tasks/get-single-task"
    private readonly _createTaskUrlPath = "/tasks/create-task"
    private readonly _deleteSelectedTaskPath = "/tasks/delete-task";
    private readonly _updateSelectedTaskPath = "/tasks/update-task";
    private readonly _fetchAllTasksSubjectsPath = "/tasks/get-all-tasks-subjects";

    // ========================== TASK COMMENTS ===========================
      private readonly _addSingleTaskCommentUrlPath = "/tasks/add-comment"
      private readonly _deleteSingleTaskCommentUrlPath = "/tasks/delete-comment"
      private readonly _updateSingleTaskCommentUrlPath = "/tasks/update-comment"


  
    constructor() {
        if (instance) { //SINGLETON DESIGN PATTERN
           throw new Error("New instance cannot be created!!");
        }
     
        instance = this;
        this._client = new HttpClient();
    }

   public async createTask(createTaskData: ICreateTaskData): Promise<any> { // TODO - POPRAWIĆ ZWRACANY TYP      
      return (await this._client.post<any, ICreateTaskData>(
        this._createTaskUrlPath, 
        createTaskData,
        true
      )).data;
   }

   public async fetchAllTasksList(offset: number, limit: number, user_id?: number, project_id?: number, filter?: string): Promise<{ total: number; tasks: ITaskResponseModel[] }> {
      const linkSearchParams = new URLSearchParams({
         limit: limit.toString(),
         offset: offset.toString()
      })

      user_id !== undefined && linkSearchParams.append("user_id", user_id.toString())
      project_id !== undefined && linkSearchParams.append("project_id", project_id.toString())
      filter !== undefined && linkSearchParams.append("search_query", filter.toString())
      
      return (await this._client.get<{ total: number; tasks: ITaskResponseModel[] }>(
          `${this._fetchAllTasksListUrlPath}?${linkSearchParams.toString()}`,
          true
      )).data
  }

  public async fetchAllTasksSubjectsList(): Promise<IAllTasksSubjectModel[]> {
      return (await this._client.get<IAllTasksSubjectModel[]>(
         this._fetchAllTasksSubjectsPath,
         true
      )).data
   }


   public async fetchSingleTaskById(taskId: number): Promise<ITaskResponseModel> {
      const linkSearchParams = new URLSearchParams({ task_id: taskId.toString() })
      
      return (await this._client.get<ITaskResponseModel>(
          `${this._fetchSingleTaskUrlPath}?${linkSearchParams.toString()}`,
          true
      )).data
  }

   public async deleteSelectedTask(taskToDeleteId: number): Promise<IOperationSuccessfulResponse> {
      const userToDeleteUrl = `${this._deleteSelectedTaskPath}/${taskToDeleteId}`
      return (await this._client.delete<IOperationSuccessfulResponse>(userToDeleteUrl, true)).data
   }

   public async updateSelectedTask(currentUserUpdatedData: IUpdateCurrentTaskData): Promise<any> {
      const { currentTaskId, updatedTaskData } = currentUserUpdatedData
      const updateCurrentUserUrl = `${this._updateSelectedTaskPath}/${currentTaskId}`

      return (await this._client.patch<ITaskResponseModel, ICreateTaskData>(
         updateCurrentUserUrl, 
         updatedTaskData,
         true
      )).data
   }


   // ========================== TASK COMMENTS ===========================

   public async addNewTaskComment(createTaskData: IAddNewTaskComment): Promise<any> { // TODO - POPRAWIĆ ZWRACANY TYP
      return (await this._client.post<any, IAddNewTaskComment>(
        this._addSingleTaskCommentUrlPath, 
        createTaskData,
        true
      )).data;
   }

   public async deleteSingleTaskComment(commentToDeleteId: number): Promise<IOperationSuccessfulResponse> {
      const userToDeleteUrl = `${this._deleteSingleTaskCommentUrlPath}/${commentToDeleteId}`
      return (await this._client.delete<IOperationSuccessfulResponse>(userToDeleteUrl, true)).data
   }

   public async updateSingleTaskComment(currentTaskCommentUpdatedData: IUpdateSingleTaskCommentData): Promise<ITaskCommentModel> {
      return (await this._client.patch<ITaskCommentModel, IUpdateSingleTaskCommentData>(
         this._updateSingleTaskCommentUrlPath, 
         currentTaskCommentUpdatedData,
         true
      )).data
   }
   // ====================================================================
}

let tasksService = Object.freeze(new TasksService())//SINGLETON DESIGN PATTERN
export default tasksService;