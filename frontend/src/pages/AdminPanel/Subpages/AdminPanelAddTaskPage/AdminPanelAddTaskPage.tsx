import { Breadcrumbs, Link } from '@mui/material'
import { AppLinks } from 'common/AppLinks'
import TaskForm from 'components/Forms/TaskForm/TaskForm'


const AdminPanelAddTaskPage = () => {
   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.adminPanel} underline="hover" color="inherit">
               Panel administracyjny
            </Link>
            <Link href={AppLinks.adminPanelAddTask} underline="hover" color="inherit">
               Dodaj zadanie
            </Link>
         </Breadcrumbs>
         <TaskForm isEditMode={false} />
      </>
   )
}

export default AdminPanelAddTaskPage