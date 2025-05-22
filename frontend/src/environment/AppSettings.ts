
export class Environment {
   public static baseApiUrl = process.env.NODE_ENV === 'development' ? "http://127.0.0.1:8000/api/v1" : "https://api-master-thesis-timesheet-app.up.railway.app/api/v1"
   public static defaultUserPasswordWhileCreating = "admin123$"


   // public static dateFormatToDisplay = "dd/mm/yy"
   public static dateFormatToDisplay = "dd/MM/yyyy"
   public static defaultRowsPerTablePage = 5
}