import { Breadcrumbs, Link } from '@mui/material'
import { AppLinks } from 'common/AppLinks'
import ProjectForm from 'components/Forms/ProjectForm/ProjectForm'


const AdminPanelAddProjectPage = () => {
   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.adminPanel} underline="hover" color="inherit">
               Panel administracyjny
            </Link>
            <Link href={AppLinks.adminPanelAddTask} underline="hover" color="inherit">
               Dodaj projekt
            </Link>
         </Breadcrumbs>
         <ProjectForm isEditMode={false} />
      </>
   )
}

export default AdminPanelAddProjectPage