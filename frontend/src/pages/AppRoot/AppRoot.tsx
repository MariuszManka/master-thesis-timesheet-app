import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLinks } from 'common/AppLinks'
import PageLayout from 'components/PageLayout/PageLayout'



import LoginPage from '../LoginPage/LoginPage'
import HomePage from 'pages/HomePage/HomePage'
import { ProtectedRoute } from 'components/ProtectedRoute/ProtectedRoute'
import ProjectsPage from 'pages/ProjectsPage/ProjectsPage'
import TimesheetPage from 'pages/TimesheetPage/TimesheetPage'
import TeamsPage from 'pages/TeamsPage/TeamsPage'
import AdminPanel, { MainAdminPanelView } from 'pages/AdminPanel/AdminPanel'
import AdminPanelAddUserPage from 'pages/AdminPanel/Subpages/AdminPanelAddUserPage/AdminPanelAddUserPage'
import AdminPanelViewAllUsers from 'pages/AdminPanel/Subpages/AdminPanelViewAllUsers/AdminPanelViewAllUsers'
import ProfilePage from 'pages/ProfilePage/ProfilePage'
import AdminPanelAddProjectPage from 'pages/AdminPanel/Subpages/AdminPanelAddProjectPage/AdminPanelAddProjectPage'
import AdminPanelEditProjectPage from 'pages/AdminPanel/Subpages/AdminPanelEditProjectPage/AdminPanelEditProjectPage'



const AppRoot = () => {

   return (
      <div className="app-container">
          <div className="app-card">
            <Routes>
               <Route path={AppLinks.root} element={<ProtectedRoute><PageLayout /></ProtectedRoute>} >
                  {/* TE KOMPONENTY KTÓRE POTRZEBUJĄ NAVBARA I CAŁEJ RESZTY */}

                  <Route path={AppLinks.home} element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                  <Route path={AppLinks.projects} element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
                  <Route path={AppLinks.timesheet} element={<ProtectedRoute><TimesheetPage /></ProtectedRoute>} />
                  <Route path={AppLinks.teams} element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
                  <Route path={AppLinks.profile} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path={AppLinks.adminPanel} element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} >
                     <Route index element={<MainAdminPanelView />} />
                     <Route path={AppLinks.adminPanelAddUser} element={<AdminPanelAddUserPage />} />
                     <Route path={AppLinks.adminPanelAllUsers} element={<AdminPanelViewAllUsers />} />
                     <Route path={AppLinks.adminPanelAddProject} element={<AdminPanelAddProjectPage />} />
                     <Route path={AppLinks.adminPanelEditProject} element={<AdminPanelEditProjectPage />} />
                  </Route>
               </Route>
               <Route path={AppLinks.login} element={<LoginPage />} />
            </Routes>
          </div>
      </div>
   )
}

export default AppRoot
