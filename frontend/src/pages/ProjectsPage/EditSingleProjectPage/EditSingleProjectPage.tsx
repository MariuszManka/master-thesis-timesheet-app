import React from 'react';
import { Breadcrumbs, Link } from '@mui/material'
                       
import { AppLinks } from 'common/AppLinks'
import { useParams } from 'react-router-dom'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ProjectForm from 'components/Forms/ProjectForm/ProjectForm'


import '../ProjectsPage.scss'


export const MainEditSingleTaskView = () => {
   const { id } = useParams()

   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.projects} underline="hover" color='inherit'>Projekty</Link>
            <Link href={`${AppLinks.projectsEditSingleProject}/${id}`} underline="hover" color='inherit'>Edycja projektu #{id}</Link>
         </Breadcrumbs>
         <ProjectForm isEditMode={true} />
      </>
   )
}


const EditSingleProjectPage = () => {
   return (
      <div className='projects-page-outer-wrapper'>
         <header className='projects-page-header-wrapper'>
            <AssignmentOutlinedIcon />
            <h1>Edycja projektu</h1>
         </header>
         <section className='projects-page-content-section-outer-wrapper'>
         <MainEditSingleTaskView />
         </section>
      </div>
   )
}

export default EditSingleProjectPage