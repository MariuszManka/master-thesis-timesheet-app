import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLinks } from 'common/AppLinks'
import PageLayout from 'components/PageLayout/PageLayout'



import LoginPage from '../LoginPage/LoginPage'
import HomePage from 'pages/HomePage/HomePage'
import { ProtectedRoute } from 'components/ProtectedRoute/ProtectedRoute'
import TasksPage from 'pages/TasksPage/TasksPage'
import TimesheetPage from 'pages/TimesheetPage/TimesheetPage'
import ProjectsPage from 'pages/ProjectsPage/ProjectsPage'
import AdminPanel, { MainAdminPanelView } from 'pages/AdminPanel/AdminPanel'
import AdminPanelAddUserPage from 'pages/AdminPanel/Subpages/AdminPanelAddUserPage/AdminPanelAddUserPage'
import AdminPanelViewAllUsers from 'pages/AdminPanel/Subpages/AdminPanelViewAllUsers/AdminPanelViewAllUsers'
import ProfilePage from 'pages/ProfilePage/ProfilePage'
import AdminPanelAddTaskPage from 'pages/AdminPanel/Subpages/AdminPanelAddTaskPage/AdminPanelAddTaskPage'
import AdminPanelViewAllTaskPage from 'pages/AdminPanel/Subpages/AdminPanelViewAllTasksPage/AdminPanelViewAllTaskPage'
import AdminPanelEditSingleTaskPage from 'pages/AdminPanel/Subpages/AdminPanelEditSingleTaskPage/AdminPanelEditSingleTaskPage'
import SingleTaskView from 'components/Views/SingleTaskView/SingleTaskView'
import EditSingleTaskPage from 'pages/TasksPage/EditSingleTaskPage/EditSingleTaskPage'
import AdminPanelAddProjectPage from 'pages/AdminPanel/Subpages/AdminPanelAddProjectPage/AdminPanelAddProjectPage'
import EditSingleProjectPage from 'pages/ProjectsPage/EditSingleProjectPage/EditSingleProjectPage'



const AppRoot = () => {

   return (
      <div className="app-container">
          <div className="app-card">
            <Routes>
               <Route path={AppLinks.root} element={<ProtectedRoute><PageLayout /></ProtectedRoute>} >
                  {/* TE KOMPONENTY KTÓRE POTRZEBUJĄ NAVBARA I CAŁEJ RESZTY */}
                  <Route path={AppLinks.home} element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                  <Route path={AppLinks.tasks} element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
                  <Route path={`${AppLinks.tasksViewSingleTask}/:id`} element={<ProtectedRoute><SingleTaskView /></ProtectedRoute>} />
                  <Route path={`${AppLinks.tasksEditSingleTask}/:id`} element={<ProtectedRoute><EditSingleTaskPage /></ProtectedRoute>} />
                  <Route path={AppLinks.timesheet} element={<ProtectedRoute><TimesheetPage /></ProtectedRoute>} />
                  <Route path={AppLinks.projects} element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
                  <Route path={`${AppLinks.projectsEditSingleProject}/:id`} element={<ProtectedRoute><EditSingleProjectPage /></ProtectedRoute>} />
                  <Route path={AppLinks.profile} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path={AppLinks.adminPanel} element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} >
                     <Route index element={<MainAdminPanelView />} />
                     <Route path={AppLinks.adminPanelAddUser} element={<AdminPanelAddUserPage />} />
                     <Route path={AppLinks.adminPanelAllUsers} element={<AdminPanelViewAllUsers />} />
                     <Route path={AppLinks.adminPanelViewAllTasks} element={<AdminPanelViewAllTaskPage />} />
                     <Route path={AppLinks.adminPanelAddTask} element={<AdminPanelAddTaskPage />} />
                     <Route path={`${AppLinks.adminPanelEditTask}/:id`} element={<AdminPanelEditSingleTaskPage />} />
                     <Route path={AppLinks.adminPanelAddProject} element={<AdminPanelAddProjectPage />} />
                  </Route>
               </Route>
               <Route path={AppLinks.login} element={<LoginPage />} />
            </Routes>
          </div>
      </div>
   )
}

export default AppRoot
