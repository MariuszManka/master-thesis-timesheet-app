import React from 'react';
import { useSelector } from 'react-redux'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import { Breadcrumbs, Link } from '@mui/material'
                       
import TasksTable from 'components/Tables/TasksTable/TasksTable'
import { AppState } from 'store'
import { AppLinks } from 'common/AppLinks'


import './TasksPage.scss'


const TasksPageContent = () => {
   const currentUserId = useSelector((state: AppState) => state.currentUserState.id)

   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.tasks} underline="hover" color='inherit'>Zadania</Link>
         </Breadcrumbs>
         <TasksTable userId={currentUserId} isAdminMode={false} />
      </>
   )
}

const TasksPage = () => {
   return (
      <div className='tasks-page-outer-wrapper'>
         <header className='tasks-page-header-wrapper'>
            <AssessmentRoundedIcon />
            <h1>Zadania</h1>
         </header>
         <section className='tasks-page-content-section-outer-wrapper'>
            <TasksPageContent />
         </section>
      </div>
   )
}

export default TasksPage