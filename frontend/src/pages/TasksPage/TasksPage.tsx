import React from 'react';
import { useSelector } from 'react-redux'
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { Breadcrumbs, Link } from '@mui/material'
                       
import TasksTable from 'components/Tables/TasksTable/TasksTable'
import { AppState } from 'store'
import { AppLinks } from 'common/AppLinks'


import './TasksPage.scss'
import { Fieldset } from 'primereact/fieldset'
import TaskForm from 'components/Forms/TaskForm/TaskForm'
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'



const AddTaskForm = () => {
   return (
      <Fieldset legend="Dodaj zadanie" toggleable collapsed className='task-add-form-outer-wrapper'>
         <TaskForm isEditMode={false} isOnlyFieldsMode={true} />
      </Fieldset>
   )
}


const TasksPageContent = () => {
   const { id: currentUserId, role: currentUserRole } = useSelector((state: AppState) => state.currentUserState)
   const IS_EMPLOYEE = currentUserRole !== SystemRoles.MANAGER
   
   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.tasks} underline="hover" color='inherit'>Zadania</Link>
         </Breadcrumbs>
         {!IS_EMPLOYEE && <AddTaskForm />}
         <TasksTable userId={currentUserId} isAdminMode={false} />
      </>
   )
}

const TasksPage = () => {
   return (
      <div className='tasks-page-outer-wrapper'>
         <header className='tasks-page-header-wrapper'>
            <TaskAltIcon />
            <h1>Zadania</h1>
         </header>
         <section className='tasks-page-content-section-outer-wrapper'>
            <TasksPageContent />
         </section>
      </div>
   )
}

export default TasksPage