import * as React from 'react';
import { AppLinks } from 'common/AppLinks'
import { Breadcrumbs, Link } from '@mui/material'
import UserForm from 'components/Forms/UserForm/UserForm'


const AdminPanelAddUserPage = () => {
   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.adminPanel} underline="hover" color="inherit">
               Panel administracyjny
            </Link>
            <Link href={AppLinks.adminPanelAddUser} underline="hover" color="inherit">
               Dodaj użytkownika
            </Link>
         </Breadcrumbs>
         <UserForm />
      </>
   )
}

export default AdminPanelAddUserPage