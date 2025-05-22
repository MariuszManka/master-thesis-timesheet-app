import React, { useCallback, useEffect, useState } from 'react';
import { Box, Breadcrumbs, Button, Card, CardActionArea, CardContent, CardMedia, Divider, Link, Slider, Tab, Tabs } from '@mui/material'

import { AppLinks } from 'common/AppLinks'
import projectsService, { IProjectsResponse, IUserProjectParticipantModel } from 'services/ProjectsService/ProjectsService'
import { useDispatch, useSelector } from 'react-redux'
import { IProjectForm, setCurrentUserProjects, setProjectFormValues } from 'store/ProjectsSlice/ProjectsSlice'
import { TabPanel, TabView } from 'primereact/tabview'
import { AppState } from 'store'
import { Fieldset } from 'primereact/fieldset'
import { DateTime } from 'luxon'
import { Environment } from 'environment/AppSettings'
import { ITaskResponseModel } from 'services/TasksService/TasksService'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { DateBodyTemplate, DescriptionBodyTemplate, EstimatedHoursBodyTemplate, TaskStatusBodyTemplate, TaskTablePriorityBodyTemplate, TaskTypeBodyTemplate } from 'components/Tables/TasksTable/TasksTable'
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import { SystemRoles } from 'common/roleConfig/globalRoleConfig'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom'
import { Dialog } from 'primereact/dialog'
import { useSnackbar } from 'notistack'


import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import './ProjectsPage.scss'


const SingleProjectDetailsView = ({ project }: { project: IProjectsResponse }) => {
   const { appDatabaseDateFormatForFront } = useSelector((state: AppState) => state.applicationState)

   const start = DateTime.fromISO(project.start_date);
   const end = DateTime.fromISO(project.end_date);
   const now = DateTime.now();
 
   const totalDays = Math.max(end.diff(start, 'days').days, 1); // prevent division by 0
   const elapsedDays = Math.min(Math.max(now.diff(start, 'days').days, 0), totalDays);


   return (
      <Fieldset legend={"Informacje"} toggleable className='single-project-details-view-outer-wrapper' style={{ borderRadius: 10 }}>
         <div className='single-project-details-view-inner-wrapper' style={{ width: 'calc(90vw - 300px)' }}>
            <div className='single-project-details-view-grid-item project-grid-item-full-width' style={{gridArea: 'project-details-project-name'}}>
               <h6 style={{ fontSize: 18 }}>Projekt:</h6>
               <p style={{ marginLeft: 15 }}>{project.name}</p>
            </div>
            <div className='single-project-details-view-grid-item project-grid-item-full-width' style={{gridArea: 'project-details-project-description', marginBottom: '10px'}}>
               <h6 style={{ fontSize: 18 }}>Opis:</h6>
               <p style={{ marginLeft: 15 }}>{project.description}</p>
            </div>
            {/* <Divider style={{ gridArea: 'project-details-divider' }} /> */}
            {/* <div className='single-project-details-view-grid-item' style={{gridArea: 'project-details-project-start-date',  marginTop: '10px'}}>
               <h6>Data rozpoczęcia:</h6>
               <p>{DateTime.fromFormat(project.start_date, appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay)}</p>
            </div>*/}
            <div className='single-project-details-view-grid-item' style={{gridArea: 'project-details-project-time-spent'}}>
               <h6>Łączny przepracowany czas:</h6>
               <p>
                  {project.total_time_spent}h
               </p>
            </div> 
            <Divider style={{ gridArea: 'project-details-divider' }} />
            <div className='single-project-details-view-grid-item' style={{gridArea: 'project-details-project-status', justifySelf: 'flex-end'}}>
               <h6>Status:</h6>
               <p>{project.status}</p>
            </div>
            <div className='single-project-details-view-grid-item' style={{gridArea: 'project-details-project-project-owner'}}>
               <h6>Prowadzący:</h6>
               <p>{project.owner_full_name}</p>
            </div>
            <div className='single-project-details-view-grid-item' style={{gridArea: 'project-details-project-participants-amount'}}>
               <h6>Ilość uczestników:</h6>
               <p>{project.participants.length}</p>
            </div>
            <div className='single-project-details-view-grid-item' style={{gridArea: 'project-details-project-tasks-amount', justifySelf: 'flex-end'}}>
               <h6>Ilość przypisanych zadań:</h6>
               <p>{project.tasks.length}</p>
            </div>
            <Slider 
               value={elapsedDays} min={0} max={totalDays} disabled
               marks={[
                  { value: 0, label: `Data rozpoczęcia: ${start.toFormat(Environment.dateFormatToDisplay)}` }, 
                  { value: totalDays, label: `Data zakończenia: ${end.toFormat(Environment.dateFormatToDisplay)}`
               }]}
               className='single-project-details-view-slider'
            />
         </div>
      </Fieldset>
   )
}


const SingleProjectTasksView = ({ projectTasks, appDatabaseDateFormatForFront }: { projectTasks: ITaskResponseModel[], appDatabaseDateFormatForFront: string }) => {
   return (
      <Fieldset legend={"Powiązane zadania"} toggleable style={{ borderRadius: 10 }}>
         <DataTable className='app-table-outer-wrapper'
            selectionMode="single" columnResizeMode="expand" paginator
            dataKey="id" size='normal'  
            scrollable style={{ maxWidth: 'calc(90vw - 300px)' }}
            value={projectTasks}
            globalFilterFields={['id', 'subject', 'priority', 'taskType', 'taskStatus']}
            emptyMessage="Brak zadań"
            rows={5} totalRecords={projectTasks.length}
         >
            <Column field="id" header="Id" style={{ minWidth: 50, maxHeight: 50, textAlign: 'center' }} />
            <Column field="subject" header="Tytuł" style={{ textAlign: 'left', minWidth: 250 }} />
            <Column field="priority" header="Priorytet" body={TaskTablePriorityBodyTemplate} />
            <Column field="description" header="Opis" style={{ minWidth: 400, maxHeight: 50 }} body={DescriptionBodyTemplate} />
            <Column field="startingDate" header="Data rozpoczęcia" style={{ textAlign: 'center' }} body={(rowData: ITaskResponseModel) => DateBodyTemplate(rowData.startingDate, appDatabaseDateFormatForFront)} />
            <Column field="dueDate" header="Data zakończenia" style={{ textAlign: 'center' }} body={(rowData: ITaskResponseModel) => DateBodyTemplate(rowData.dueDate ?? null, appDatabaseDateFormatForFront)} />
            <Column field="taskType" header="Typ zagadnienia" body={TaskTypeBodyTemplate} /> 
            <Column field="taskStatus" header="Status" body={TaskStatusBodyTemplate} />
            <Column field="estimatedHours" header="Szacowany czas" style={{ textAlign: 'center' }} body={(rowData: ITaskResponseModel) => EstimatedHoursBodyTemplate(rowData.estimatedHours)} />
         </DataTable>
      </Fieldset>
   )
}



const AssignedUserSingleCard = ({ user, isProjectOwner, currentUserId }: { user: IUserProjectParticipantModel, isProjectOwner: boolean, currentUserId?: number }) => {
   const getAvatar = () => {
      if(user.user_info.avatar) {
         return user.user_info.avatar
      }
      else {
         if(isProjectOwner) {
            return `https://ui-avatars.com/api/?name=${user.user_info.full_name.trim().split(" ").join("+")}&background=010440&color=f1f1f1`
         }
         else {
            return `https://ui-avatars.com/api/?name=${user.user_info.full_name.trim().split(" ").join("+")}&background=f1f1f1&color=010440`
         }
      }
   }

   return (
      <Card className={`single-project-details-view-assigned-users-card-wrapper ${isProjectOwner? 'project-owner-card' : ''} ${user.id === currentUserId? 'current-user' : ''}`}>
         <CardMedia component="img" image={getAvatar()} />
         <CardContent className='single-project-details-view-assigned-users-card-content'>
            <h5>{user.user_info.full_name}</h5>
            <p>{user.user_info.position}</p>
            <div className='single-project-details-view-assigned-users-card-footer'>
               {isProjectOwner ? <p className='project-owner-label'>Prowadzący</p> : <p/>}
               <a href={`mailto:${user.email}`} style={{ display: 'inline-flex', alignItems: 'center', columnGap: 5 }}>
                  {user.email}
                  <AlternateEmailOutlinedIcon style={{ width: 18, marginTop: 2}} />
               </a>
            </div>
         </CardContent>
      </Card>
   )
}

const SingleProjectAssignedUsersView = ({ projectAssignedUsers, projectOwner, currentUserId }: { projectAssignedUsers: IUserProjectParticipantModel[], projectOwner: IUserProjectParticipantModel, currentUserId: number }) => {
   return (
      <Fieldset legend={"Uczestnicy projektu"} toggleable style={{ borderRadius: 10 }}>
         <AssignedUserSingleCard user={projectOwner} isProjectOwner={true} />
         <div className='single-project-details-view-assigned-users-card-all-users-wrapper'> 
            {projectAssignedUsers.map((user, index) => {
               return (
                  <AssignedUserSingleCard user={user} isProjectOwner={false} currentUserId={currentUserId} />
               )
            })}
         </div>
      </Fieldset>
   )
}


const ProjectsPageContent = () => {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { enqueueSnackbar } = useSnackbar()

   const currentUserProjects = useSelector((state: AppState) => state.projectsState.currentUserProjects)
   const { appDatabaseDateFormatForFront } = useSelector((state: AppState) => state.applicationState)
   const { id: currentUserId, role: currentUserRole } = useSelector((state: AppState) => state.currentUserState)

   const [selectedTab, setSelectedTab] = useState(0)
   const [isDialogVisible, setIsDialogVisible] = useState(false)
   

   const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
      setSelectedTab(newValue);
   }

   const handleEditProject = (project: IProjectsResponse) => {
      
      const mappedProjectObject: IProjectForm = {
         name: project.name,
         description: project.description,
         start_date: DateTime.fromFormat(project.start_date as string, appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay),
         end_date: DateTime.fromFormat(project.end_date as string, appDatabaseDateFormatForFront).toFormat(Environment.dateFormatToDisplay),
         status: project.status,
         owner_id: project.owner_id,
         participants: project.participants.map((user) => user.id),
         assignedTasks: project.tasks.map((task) => task.id)
      }
      
      dispatch(setProjectFormValues({ ...mappedProjectObject }))
      navigate(`${AppLinks.projectsEditSingleProject}/${project.id}`, { state: { fromNavigation: true }})
   }


   const handleOnProjectDelete = useCallback(async (project: IProjectsResponse) => {
      try {
         await projectsService.deleteSelectedProject(project.id)

         const response = await projectsService.fetchAllUserProjectsList()
         dispatch(setCurrentUserProjects(response))

         enqueueSnackbar(`Poprawnie usunięto projekt [${project.id}]`, { variant: 'success', autoHideDuration: 5000 })
         setIsDialogVisible(false)
      } 
      catch (error) {
         enqueueSnackbar("Nie udało się usunąć projektu.", { variant: "error", autoHideDuration: 5000, preventDuplicate: true })
         setIsDialogVisible(false)
      }
   }, [ enqueueSnackbar ])


   const dialogFooterContent = (project: IProjectsResponse) => (
      <div>
         <Button onClick={() => handleOnProjectDelete(project)}  className='app-table-delete-modal-button agree-button' style={{ marginRight: 20 }}>Tak</Button>
         <Button onClick={() => setIsDialogVisible(false)} className="app-table-delete-modal-button disagree-button" >Nie</Button>
      </div>
   )
   

   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.projects} underline="hover" color='inherit'>Projekty</Link>
         </Breadcrumbs>
         {/* <TabView scrollable>
            {
               currentUserProjects.map((project, index) => {
                  return (
                     <TabPanel header={project.name} key={index}>
                        <div className='projects-page-tab-content-wrapper'>
                           <SingleProjectDetailsView project={project} />
                        </div>
                     </TabPanel>
                  )
               })
            }
         </TabView> */}
         <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            {currentUserProjects.map((project, index) => <Tab label={project.name} key={index} wrapped/>)}
        </Tabs>
         {currentUserProjects.map((project, index) => (
         selectedTab === index && (
            <Box key={index} className="projects-page-tab-content-wrapper">
               <SingleProjectDetailsView project={project} />
               <SingleProjectTasksView projectTasks={project.tasks} appDatabaseDateFormatForFront={appDatabaseDateFormatForFront} />
               <SingleProjectAssignedUsersView projectAssignedUsers={project.participants} projectOwner={project.owner} currentUserId={currentUserId} />
               {
                  (currentUserRole === SystemRoles.MANAGER) && (
                     <Button 
                        className="app-page-form-submit-button" variant="contained" 
                        style={{ width: 330, height: 45, margin: '35px auto 0 auto' }} 
                        onClick={() => handleEditProject(project)}
                     >
                        Edytuj projekt <EditIcon style={{ marginLeft: 15, marginTop: -5}} />
                     </Button>
                  )
               }
               {
                  (currentUserRole === SystemRoles.ADMIN) && (
                     <>
                        <Button 
                           className="app-page-form-delete-button" variant="contained" 
                           style={{ width: 330, height: 45, margin: '35px auto 0 auto' }} 
                           onClick={() => setIsDialogVisible(true)}
                        >
                           Usuń projekt <DeleteIcon style={{ marginLeft: 15, marginTop: -5}} />
                        </Button>
                        <Dialog
                           header="Potwierdź akcję" visible={isDialogVisible} style={{ width: '35vw' }} draggable={false} resizable={false}
                           onHide={() => setIsDialogVisible(false)} footer={() => dialogFooterContent(project)}
                        >
                           Czy na pewno chcesz usunąć projekt: <br/>
                           <b>{`[${project.id}] ${project.name}?`}</b> <br/><br/>
                           <b>Usunięcie projektu, skutkuje usunięciem wszystkich przypisanych do niego zdań.</b>
                        </Dialog>
                     </>
                  )
               }
            </Box>
         )
         ))}
      </>
   )
}

const ProjectsPage = () => {
   const dispatch = useDispatch()

   useEffect(() => {
      (async () => {
         const response = await projectsService.fetchAllUserProjectsList()
         dispatch(setCurrentUserProjects(response))
      })()
      
   }, [])


   return (
      <div className='projects-page-outer-wrapper'>
         <header className='projects-page-header-wrapper'>
            <AssignmentOutlinedIcon />
            <h1>Projekty</h1>
         </header>
         <section className='projects-page-content-section-outer-wrapper'>
            <ProjectsPageContent />
         </section>
      </div>
   )
}

export default ProjectsPage