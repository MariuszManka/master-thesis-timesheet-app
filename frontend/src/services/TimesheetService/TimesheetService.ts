import { HttpClient } from 'common/HttpClient'
import { IOperationSuccessfulResponse } from 'models/HttpRequestModels'
import { ISingleTimesheetTableEntry } from 'store/TimesheetSlice/TimesheetSlice'


// ========================================== INTERFACES ==========================================
   export interface ICreateTimesheetData {
      activityDate: string;
      timeSpentInHours: number;
      taskDescription: string;
      activityType: string;
      assignedTaskId: number;
   }

   export interface IUpdateTimesheetModel {
      activityDate?: string;
      timeSpentInHours?: number;
      taskDescription?: string;
      activityType?: string;
      assignedTaskId?: number;
   }
   export interface IUpdateCurrentTimesheetData {
      currentTimesheetId: number;
      updatedTimesheetData: IUpdateTimesheetModel;
   }

   export interface ITimesheetInTaskModel {
      id: number;
      activityDate: Date;
      timeSpentInHours: string;
      taskDescription: string;
      activityType: string;
      assignedTaskId: number;
      accountId: number;
      isCurrentUserTimesheet: boolean;
   }

   export interface ITimesheetResponse {
      total: number,
      tree: ISingleTimesheetTableEntry[]
   }

   export interface ITaskTimesheetResponse {
      total: number,
      timesheets: ITimesheetInTaskModel[]
   }
// ================================================================================================


//#region SettingService Instance
let instance: TimesheetService
//#endregion


export class TimesheetService {
    private readonly _client: HttpClient;
    private readonly _fetchAllTeamTimesheetsUrlPath = "/timesheet/get-team-timesheets-entries"
    private readonly _fetchAllUserTimsheetsUrlPath = "/timesheet/get-user-timesheets-entries"
    private readonly _fetchTaskTimsheetsUrlPath = "/timesheet/get-task-timesheets"
    private readonly _createTimesheetEntryUrlPath = "timesheet/add-timesheet-entry"
    private readonly _updateTimesheetEntryUrlPath = "timesheet/update-timesheet"
    private readonly _deleteTimesheetEntryUrlPath = "/timesheet/delete-timesheet-entry"
  
    constructor() {
        if (instance) { //SINGLETON DESIGN PATTERN
           throw new Error("New instance cannot be created!!");
        }
     
        instance = this;
        this._client = new HttpClient();
    }

   public async createTimesheetEntry(createTimesheetData: ICreateTimesheetData): Promise<any> { // TODO - POPRAWIĆ ZWRACANY TYP
      return (await this._client.post<any, ICreateTimesheetData>(
        this._createTimesheetEntryUrlPath, 
        createTimesheetData,
        true
      )).data;
   }

   public async getCurrentUserTimesheets(offset: number, limit: number, filter?: string) : Promise<ITimesheetResponse> {
      const linkSearchParams = new URLSearchParams({
         limit: limit.toString(),
         offset: offset.toString()
      })

      filter !== undefined && linkSearchParams.append("search_query", filter.toString())

      return (await this._client.get<ITimesheetResponse>(`${this._fetchAllUserTimsheetsUrlPath}?${linkSearchParams.toString()}`, true)).data;
   }

   
   public async getCurrentTeamTimesheets(offset: number, limit: number, filter?: string) : Promise<ITimesheetResponse> {
      const linkSearchParams = new URLSearchParams({
         limit: limit.toString(),
         offset: offset.toString()
      })

      filter !== undefined && linkSearchParams.append("search_query", filter.toString())

      return (await this._client.get<ITimesheetResponse>(`${this._fetchAllTeamTimesheetsUrlPath}?${linkSearchParams.toString()}`, true)).data;
   }


   public async getTaskTimesheets(taskId: number, offset: number, limit: number, filter?: string) : Promise<ITaskTimesheetResponse> {
      const linkSearchParams = new URLSearchParams({
         task_id: taskId.toString(),
         limit: limit.toString(),
         offset: offset.toString()
      })

      filter !== undefined && linkSearchParams.append("search_query", filter.toString())

      return (await this._client.get<ITaskTimesheetResponse>(`${this._fetchTaskTimsheetsUrlPath}?${linkSearchParams.toString()}`, true)).data;
   }


   public async updateSelectedTimesheet(timesheetUpdatedData: IUpdateCurrentTimesheetData): Promise<ITimesheetInTaskModel> {
      const { currentTimesheetId, updatedTimesheetData } = timesheetUpdatedData

      const updateCurrentUserUrl = `${this._updateTimesheetEntryUrlPath}/${currentTimesheetId}`
      
      return (await this._client.patch<ITimesheetInTaskModel, IUpdateTimesheetModel>(
         updateCurrentUserUrl, 
         updatedTimesheetData,
         true
      )).data
   }

   public async deleteSelectedTimesheet(timesheetToDeleteId: number): Promise<IOperationSuccessfulResponse> {
      const userToDeleteUrl = `${this._deleteTimesheetEntryUrlPath}/${timesheetToDeleteId}`
      return (await this._client.delete<IOperationSuccessfulResponse>(userToDeleteUrl, true)).data
   }
}

let timesheetService = Object.freeze(new TimesheetService())//SINGLETON DESIGN PATTERN
export default timesheetService;