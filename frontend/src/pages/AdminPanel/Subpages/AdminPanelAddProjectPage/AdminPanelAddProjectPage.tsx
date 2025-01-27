import React from 'react';

import './AdminPanelAddProjectPageStyles.scss'
import { Breadcrumbs, Link } from '@mui/material'
import { AppLinks } from 'common/AppLinks'

const AdminPanelAddProjectPage = () => {

   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.adminPanel} underline="hover" color="inherit">
               Panel administracyjny
            </Link>
            <Link href={AppLinks.adminPanelAddProject} underline="hover" color="inherit">
               Dodaj projekt
            </Link>
         </Breadcrumbs>
      </>
   )
}

export default AdminPanelAddProjectPage
