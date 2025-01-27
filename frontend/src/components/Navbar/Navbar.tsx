import React from 'react'

import { Navigate, NavLink, useNavigate } from 'react-router-dom'
import { AppLinks } from 'common/AppLinks'
import { useSelector } from 'react-redux'
import { AppState } from 'store'

import './NavbarStyles.scss';
import { RoleBasedNavbarItems } from 'common/roleConfig/NavbarRoleConfig/NavbarRoleConfig'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'
import authService from 'services/AuthService/AuthService'
import { SessionStorage } from 'common/CookieStorage'
import { AppStorage } from 'common/AppStograge'
import { useSnackbar } from 'notistack'
import { CustomAxiosErrorResponse } from 'common/HttpClient'
import { Tooltip } from 'primereact/tooltip'



const Navbar = () => {
   const navigate = useNavigate()
   const { enqueueSnackbar } = useSnackbar()
   const currentUserRole = useSelector((state: AppState) => state.currentUserState.role)
   const sessionStorage = new SessionStorage()
   const appStorage = new AppStorage()

   if (currentUserRole === SystemRoles.DEFAULT) {
      <Navigate to={AppLinks.login} />
      return null
   }

   const handleLogoutUser = async() => {

      try {
         await authService.logoutUser()
         sessionStorage.clearSessionStorage()
         appStorage.clearLocalStorage()
   
         enqueueSnackbar('Użytkownik pomyślnie wylogowany', { variant: 'success', autoHideDuration: 5000 })
         navigate(AppLinks.login)
      }
      catch (e: any) {
         if(e instanceof CustomAxiosErrorResponse){
            enqueueSnackbar(`Błąd podczas wylogowywania użytkownika: ${e.message}`, { variant: 'error', autoHideDuration: 5000 })
         }
      }
   }

   return (
      <nav className='page-navbar-wrapper'>
         <ul className='page-navbar-inner-items-wrapper'>
            {
               RoleBasedNavbarItems[currentUserRole].map(navbarItem => React.createElement(React.Fragment, { key: navbarItem.key }, navbarItem))
            }
         </ul>
         <Tooltip target=".page-navbar-logout-button" />
         <i className='pi pi-sign-out page-navbar-logout-button' onClick={handleLogoutUser} data-pr-tooltip='Wyloguj' data-pr-position="right" data-pr-at="right+10 center"/>
      </nav>
   )
}

export default Navbar