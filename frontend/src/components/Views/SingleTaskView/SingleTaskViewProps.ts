import { ITaskCommentModel, ITaskResponseModel } from 'services/TasksService/TasksService'

export interface ISingleTaskViewTaskStatsProps {
   startingDate: string;
   appDatabaseDateFormatForFront: string;
   dueDate?: string;
   estimatedHours?: number;
}

export interface ISingleTaskViewDescriptionProps {
   descriptionInHTMLFormat: string;
}


export interface ISingleTaskCommentsProps {
   // comments: ITaskCommentModel[];
   currentUserId: number;
   currentTaskId: number;
}

export interface ISingleTaskViewTaskInfoProps {
   currentSelectedTask: ITaskResponseModel;
   appDatabaseDateFormatForFront: string;
}