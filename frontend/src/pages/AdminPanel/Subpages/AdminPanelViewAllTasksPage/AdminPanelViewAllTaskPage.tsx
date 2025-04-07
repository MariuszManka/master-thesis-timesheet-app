import React, { useEffect, useState } from 'react';
import { Breadcrumbs, Link } from '@mui/material'

import { AppLinks } from 'common/AppLinks'
import TasksTable from 'components/Tables/TasksTable/TasksTable'


const AdminPanelViewAllTaskPage = () => {
   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.adminPanel} underline="hover" color="inherit">
               Panel administracyjny
            </Link>
            <Link href={AppLinks.adminPanelViewAllTasks} underline="hover" color="inherit">
               Wszystkie zadania
            </Link>
         </Breadcrumbs>
         <TasksTable isAdminMode={true} />
      </>
   )
}

export default AdminPanelViewAllTaskPage