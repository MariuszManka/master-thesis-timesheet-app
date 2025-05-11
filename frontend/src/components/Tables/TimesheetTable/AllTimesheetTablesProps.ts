import { CURRENT_TIMESHEET_MODE } from 'pages/TimesheetPage/TimesheetPage'
import { ColumnEditorOptions } from 'primereact/column'
import { Dispatch } from 'react'

export interface ITimesheetTableProps {
   currentTimesheetMode: CURRENT_TIMESHEET_MODE;
   isLoading: boolean;
   setCurrentTimesheetMode: Dispatch<CURRENT_TIMESHEET_MODE>;
   setIsLoading: Dispatch<boolean>;
}

export interface IUseTimesheetTablesLogicProps {
   setIsLoading: Dispatch<boolean>;
   loadLazyData: () => Promise<void>;
}

export interface IUseTimesheetTablesLogicReturnProps {
   editedRowsTemplate: (content: string, showIcon: boolean) => JSX.Element;
   onHandleCellEditComplete: (fieldName: string, timesheetId: number, currentInputValue: string) => Promise<void>;
   actionsBodyTemplate: (isActionAvailable: boolean, timesheetToDeleteId: number) => JSX.Element;
   InlineCellEditor: (options: ColumnEditorOptions, isFromTaskTimesheetTable: boolean) => JSX.Element | undefined;
   DeleteTimesheetEntryModal: () => JSX.Element;
}