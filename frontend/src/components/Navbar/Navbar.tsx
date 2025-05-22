import React from 'react'

import { Navigate, NavLink, useNavigate } from 'react-router-dom'
import { AppLinks } from 'common/AppLinks'
import { useSelector } from 'react-redux'
import { AppState } from 'store'

import './NavbarStyles.scss';
import { ReactComponent as PageLogo } from '../../assets/logo_v2.svg'
import { RoleBasedNavbarItems } from 'common/roleConfig/NavbarRoleConfig/NavbarRoleConfig'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'
import authService from 'services/AuthService/AuthService'
import { SessionStorage } from 'common/CookieStorage'
import { AppStorage } from 'common/AppStograge'
import { useSnackbar } from 'notistack'
import { CustomAxiosErrorResponse } from 'common/HttpClient'
import { Tooltip } from 'primereact/tooltip'
import { Divider } from 'primereact/divider'
import { Avatar } from 'primereact/avatar'



const Navbar = () => {
   const navigate = useNavigate()
   const { enqueueSnackbar } = useSnackbar()
   const currentUser = useSelector((state: AppState) => state.currentUserState)
   const sessionStorage = new SessionStorage()
   const appStorage = new AppStorage()

   const {role, user_info: { full_name }} = currentUser

   if (role === SystemRoles.DEFAULT) {
      <Navigate to={AppLinks.login} />
      return null
   }

   const handleLogoutUser = async() => {
      try {
         sessionStorage.clearSessionStorage()
         appStorage.clearLocalStorage()
         await authService.logoutUser()
   
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
         <div className='page-navbar-logo'>
            {/* <h1>3Q Code</h1> */}
            <PageLogo />
         </div>
         <ul className='page-navbar-inner-items-outer'>
            {
               RoleBasedNavbarItems[role].map(navbarItem => React.createElement(React.Fragment, { key: navbarItem.key }, navbarItem))
            }
         </ul>
         <div className='page-navbar-footer-outer'>
            <div className='page-navbar-footer-avatar-wrapper'>
               <Avatar image={`https://avatar.iran.liara.run/username?username=${full_name.trim().split(" ").join("+")}&background=f1f1f1&color=010440`} shape='circle'/>
               <p data-pr-tooltip={full_name} className='page-navbar-footer-avatar-username'>{full_name}</p>
               <Tooltip target=".page-navbar-footer-avatar-username" />
            </div>
            <Tooltip target=".page-navbar-logout-button" />
            <i className='pi pi-sign-out page-navbar-logout-button' onClick={handleLogoutUser} data-pr-tooltip='Wyloguj' data-pr-position="right" data-pr-at="right+10 center"/>
         </div>
      </nav>
   )
}

export default Navbar