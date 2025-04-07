import { HttpClient } from 'common/HttpClient'


// ========================================== INTERFACES ==========================================
   export interface ICreateTimesheetData {
      subject: string;
      description: string;
      taskType?: string;
      taskStatus?: string;
      priority?: string;
      startingDate: Date;
      dueDate?: Date;
      estimatedHours?: number;
      parentTaskId?: number;
   }

   export interface ITimesheetResponseModel {
      id: number;
      activityDate: Date;
      timeSpentInHours: string;
      taskDescription: string;
      activityType: string;
      assignedTaskId: number;
      accountId: number;
   }
// ================================================================================================


//#region SettingService Instance
let instance: TimesheetService
//#endregion


export class TimesheetService {
    private readonly _client: HttpClient;
    private readonly _fetchCurrentUserTimsheetsUrlPath = "/timesheet/get-current-user-timesheets"
    private readonly _createTimesheetEntryUrlPath = "timesheet/add-timesheet-entry"
  
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

   public async getCurrentUserTimesheets() : Promise<ITimesheetResponseModel[]> {
      return (await this._client.get<ITimesheetResponseModel[]>(this._fetchCurrentUserTimsheetsUrlPath, true)).data;
   }
}

let timesheetService = Object.freeze(new TimesheetService())//SINGLETON DESIGN PATTERN
export default timesheetService;