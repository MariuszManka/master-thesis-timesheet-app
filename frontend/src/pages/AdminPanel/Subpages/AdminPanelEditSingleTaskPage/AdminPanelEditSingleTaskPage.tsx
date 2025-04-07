
import { Breadcrumbs, Link } from '@mui/material'
import { AppLinks } from 'common/AppLinks'
import TaskForm from 'components/Forms/TaskForm/TaskForm'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'




const AdminPanelEditSingleTaskPage = () => {
   const { id } = useParams()
   const location = useLocation()
   const navigate = useNavigate()

   useEffect(() => {
      if (!location.state?.fromNavigation) { //Jeśli użytkownik wpisze adres "z palca", to wracamy go na stronę ze wszystkimi zadaniami
         navigate(AppLinks.adminPanelViewAllTasks)
      }
   }, [location.state, navigate])


   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.adminPanel} underline="hover" color="inherit">
               Panel administracyjny
            </Link>
            <Link href={AppLinks.adminPanelViewAllTasks} underline="hover" color="inherit">
               Wszystkie zadania
            </Link>
            <Link href={`${AppLinks.adminPanelEditTask}/${id}`} underline="hover" color="inherit">
               Edytuj zadanie #{id}
            </Link>
         </Breadcrumbs>
         <TaskForm isEditMode={true} />
      </>
   )
}

export default AdminPanelEditSingleTaskPage