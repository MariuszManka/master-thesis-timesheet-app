import React from 'react';

import './AdminPanelEditProjectPageStyles.scss'
import { Breadcrumbs, Link } from '@mui/material'
import { AppLinks } from 'common/AppLinks'


const AdminPanelEditProjectPage = () => {

   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.adminPanel} underline="hover" color="inherit">
               Panel administracyjny
            </Link>
            <Link href={AppLinks.adminPanelEditProject} underline="hover" color="inherit">
               Edytuj projekt
            </Link>
         </Breadcrumbs>
      </>
   )
}

export default AdminPanelEditProjectPage
