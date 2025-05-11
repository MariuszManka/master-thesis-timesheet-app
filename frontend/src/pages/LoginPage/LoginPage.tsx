import React, { useState } from 'react';

import CompanyLogo from '../../assets/company_logo.png';
import { ILoginPageInputProps } from './LoginPageProps'
import authService, { IUserLoginData } from 'services/AuthService/AuthService'
import { STORAGEKEYS } from 'environment/Keys'
import { useNavigate } from 'react-router-dom'
import { AppLinks } from 'common/AppLinks'
import { SessionStorage } from 'common/CookieStorage'


import './LoginPageStyles.scss'
import { useDispatch } from 'react-redux'
import { setCurrentUserData } from 'store/CurrentUserSlice/CurrentUserSlice'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'
import { useSnackbar } from 'notistack'
import { CustomAxiosErrorResponse } from 'common/HttpClient'
import settingsService from 'services/SettingsService/SettingsService'
import { fetchAllProjectsSubjects, fetchAllTasksInfoArray, fetchAllUsersNamesArray, fetchCurrentAppConfig } from 'store/ApplicationSlice/ApplicationSlice'
import projectsService from 'services/ProjectsService/ProjectsService'



const LoginPageInput = (props: ILoginPageInputProps) => {
   const [currentValue, setCurrentValue] = useState<string>("")
   const { label, inputId, placeholder, inputType } = props

   return (
      <div className='login-page-input-inner-wrapper'>
         <label className='login-page-input-label' htmlFor={inputId}>{label}</label>
         <input
            name={inputId} 
            id={inputId}
            className='login-page-input-input'
            value={currentValue}
            placeholder={placeholder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentValue(e.target.value)}
            type={inputType}
         />
      </div>
   )
}

const LoginPageForm = () => {

   const LOGIN_FORM_ID = 'login-page-login-form'
   const LOGIN_INPUT_NAME = 'login-page-email-input'
   const PASSWORD_INPUT_NAME = 'login-page-password-input'

   const sessionStorage = new SessionStorage()
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { enqueueSnackbar } = useSnackbar()

   const  handleLoginUser = async(e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const currentForm = document.querySelector(`form[id='${LOGIN_FORM_ID}']`) as HTMLFormElement

      try {
         const formData = new FormData(currentForm)  //Tworzymy obiekt FormData dla obecnego formularza. Obiekt ten zawiera tablicę obiektów: {nazwaPola, wartośćPola}
         
         const userDataFromForm: IUserLoginData = {
            username: formData.get(LOGIN_INPUT_NAME) as string ?? "",
            password: formData.get(PASSWORD_INPUT_NAME) as string ?? "",
         }

         const tokenResponse = await authService.loginUser(userDataFromForm)
         sessionStorage.add(STORAGEKEYS.ACCESS_TOKEN, tokenResponse.access_token)


         const currentAppConfig = await settingsService.fetchCurrentAppConfig()
         const allUsersNamesArray = await settingsService.fetchAllUsersNames()

         const allProjectsSubjects = await projectsService.fetchAllProjectsSubjectsList()


         // TODO - ZASTANOWIĆ SIĘ CZY KONIECZNE
         const allTasksInfoArray = await settingsService.fetchAllTasksInfo()
         dispatch(fetchAllTasksInfoArray(allTasksInfoArray))

         dispatch(setCurrentUserData(tokenResponse.user_data))
         dispatch(fetchCurrentAppConfig(currentAppConfig))
         dispatch(fetchAllUsersNamesArray(allUsersNamesArray))
         dispatch(fetchAllProjectsSubjects(allProjectsSubjects))
   
      

         navigate(AppLinks.projects)
      }
      catch(error: any) {
         if(error instanceof CustomAxiosErrorResponse){
            enqueueSnackbar(`Błąd logowania: ${ error.message }`, { variant: 'error', autoHideDuration: 5000 })
            currentForm.reset()
         }
      }
   }


   return (
      <div className='login-page-outer-wrapper' id={LOGIN_FORM_ID}>
         <div className='login-page-login-form-label-wrapper'>
            <label className='login-page-login-form-label' htmlFor="login-page-login-form"> Logowanie </label>
            <div className='login-page-login-form-label-underline'/>
         </div>
         <form id={LOGIN_FORM_ID} onSubmit={handleLoginUser}>
            <LoginPageInput
               label='Email'
               inputId={LOGIN_INPUT_NAME}
               placeholder='Wpisz adres email'
               inputType='text'
            />
            <LoginPageInput
               label='Hasło'
               inputId={PASSWORD_INPUT_NAME}
               placeholder='Wpisz hasło'
               inputType="password"
            />
            <p className='login-page-login-form-forgot-password'>Zapomniałeś hasła?</p>
            <button type='submit' className='login-page-login-for-submit-button'>Zaloguj</button>
         </form>
      </div>
   )
}

const LoginPage = () => {

   return (
      <main className='login-page-wrapper'>
         <header className='login-page-navbar'>
            <img src={ CompanyLogo } alt={"Logo"} />
         </header>
         <LoginPageForm />
      </main>
   )
}

export default LoginPage
