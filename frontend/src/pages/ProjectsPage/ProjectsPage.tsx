import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';                             




import { ReactComponent as  NavbarProjectsIcon } from 'assets/icons/navbar-projects-icon.svg'

import './ProjectsPage.scss'

const mockProjects = [
   {
      title: 'Example project 1',
      projectId: '#0001'
   },
   {
      title: 'Example project 2',
      projectId: '#0002'
   },
   {
      title: 'Example project 3',
      projectId: '#0003'
   },
   {
      title: 'Example project 4',
      projectId: '#0004'
   },
   {
      title: 'Example project 5',
      projectId: '#0005'
   },
]

const Projects = () => {
   return (
      <div className='project-all-cards-outer-wrapper'>
      {
         mockProjects.map((singleProject) => {
            return (
               <Card title={singleProject.title} subTitle={singleProject.projectId} className="project-card-outer-wrapper">
                  <p className="m-0">
                     Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae 
                     numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque quas!
                  </p>
               </Card>
            )
         })
      }
      </div>
   )
}

const ProjectsPage = () => {

   return (
      <div>
         <section>
            <header className='projects-page-heading'>
               <NavbarProjectsIcon />
               <p>Projekty</p>
            </header>
            <div style={{background: "#C4C4C4", width: '70%', height: 50, margin: '20px 0 40px 85px'}}></div> 
            <Projects />
            <Button label="Check" icon="pi pi-check" />
         </section>
      </div>
   )
}

export default ProjectsPage
