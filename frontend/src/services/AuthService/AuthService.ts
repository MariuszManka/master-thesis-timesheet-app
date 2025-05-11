import { AxiosResponse } from 'axios'
import { HttpClient } from 'common/HttpClient'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'
import { Environment } from 'environment/AppSettings'
import { IOperationSuccessfulResponse } from 'models/HttpRequestModels'
import { ISingleUserDataModel, IUserAddressesModel, IUserInfoModel, IUserPreferencesModel } from 'store/admin/AdminPanelSlice/AdminPanelSlice'


// ========================================== INTERFACES ==========================================

export interface IUserLoginResponse {
   access_token: string;
   token_type: string;
   ok: boolean;
   user_data: ISingleUserDataModel;
}

export interface IUserLoginData {
   username: string;
   password: string;
}

export interface ICreateUserAccountData {
   email: string;
   role: SystemRoles | '';
   position: string;
   active: boolean;
   full_name: string;
   plane_password: string;
}

export interface IPartialSingleUserDataModel extends Omit<ISingleUserDataModel, 'user_info' | 'user_preferences'> {
   user_info: Partial<IUserInfoModel>;
   user_preferences: Partial<IUserPreferencesModel>;
}

export interface IUpdateUserAddress extends Partial<IUserAddressesModel>{
   id: number;
}

export interface IUpdateCurrentUserData {
   updatedUserData: IPartialSingleUserDataModel;
   currentUserId: number;
}

export interface IUploadUserAvatarResponse {
   isOk: boolean;
   avatarBase64: string;
}

export interface IAuthServiceProps {
   loginUserApi: (userData: IUserLoginData) => Promise<AxiosResponse<IUserLoginResponse, any>> 
}


// ================================================================================================


//#region SettingService Instance
let instance: AuthService
//#endregion


export class AuthService{
    private readonly _client: HttpClient;
    private readonly _loginUrlPath = "/users/login";
    private readonly _logoutUrlPath = "/users/logout";
    private readonly _createUserAccountPath = "/users/create-account";
    private readonly _getAllUsersAccountsPath = "/users/get-all-users-list";
    private readonly _deleteSelectedUserAccountPath = "/users/delete-user";
    private readonly _updateCurrentUserAccountPath = "/users/update-user";
    private readonly _uploadUserAvatarPath = "/users/upload-avatar";
    private readonly _updateUserAddressPath = "/users/update-user-address";
  
    constructor() {
        if (instance) { //SINGLETON DESIGN PATTERN
           throw new Error("New instance cannot be created!!");
        }
     
        instance = this;
        this._client = new HttpClient();
    }

   public async loginUser(userData: IUserLoginData): Promise<IUserLoginResponse> {
      const formData = new URLSearchParams()

      formData.append("grant_type", "password")
      formData.append("username", userData.username)
      formData.append("password", userData.password)

      return (await this._client.post<IUserLoginResponse, string>(
         this._loginUrlPath,
         formData.toString(),
         false,
         {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
         }
      )).data;
   }

   public async logoutUser() : Promise<string> {
      return (await this._client.post<string, {}>(this._logoutUrlPath, {}, true)).data;
   }

   public async createUserAccount(createUserAccountData: Omit<ICreateUserAccountData, 'plane_password'>): Promise<any> { // TODO - POPRAWIĆ ZWRACANY TYP
      const createUserAccountDataWithPassword = {
         ...createUserAccountData,
         plane_password: Environment.defaultUserPasswordWhileCreating,
      }

      return (await this._client.post<any, ICreateUserAccountData>(
        this._createUserAccountPath, 
        createUserAccountDataWithPassword,
        true
      )).data;
   }

   public async getAllUsersAccounts() : Promise<ISingleUserDataModel[]> {
      return (await this._client.get<ISingleUserDataModel[]>(this._getAllUsersAccountsPath, true)).data;
   }

   public async deleteSelectedUser(userToDeleteId: number): Promise<IOperationSuccessfulResponse> {
      const userToDeleteUrl = `${this._deleteSelectedUserAccountPath}/${userToDeleteId}`
      return (await this._client.delete<IOperationSuccessfulResponse>(userToDeleteUrl, true)).data
   }

   public async updateCurrentUser(currentUserUpdatedData: IUpdateCurrentUserData): Promise<ISingleUserDataModel> {
      const { currentUserId, updatedUserData } = currentUserUpdatedData

      const updateCurrentUserUrl = `${this._updateCurrentUserAccountPath}/${currentUserId}`
      
      return (await this._client.patch<ISingleUserDataModel, IPartialSingleUserDataModel>(
         updateCurrentUserUrl, 
         updatedUserData,
         true
       )).data
   }

   public async uploadUserAvatar(avatar: File, userId: number): Promise<IUploadUserAvatarResponse> {
      const formData = new FormData()
      formData.append('avatar', avatar)
      formData.append('id', userId.toString())

      return (await this._client.upload<IUploadUserAvatarResponse>(this._uploadUserAvatarPath, formData, true)).data
   }

   public async updateUserAddress(updates: IUpdateUserAddress): Promise<IUserAddressesModel[]> {

      return (await this._client.patch<IUserAddressesModel[], IUpdateUserAddress>(
         this._updateUserAddressPath, 
         updates,
         true
      )).data   
   }
}

let authService = Object.freeze(new AuthService())//SINGLETON DESIGN PATTERN
export default authService;