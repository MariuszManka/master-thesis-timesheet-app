import React from 'react';

import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { Breadcrumbs, Link } from '@mui/material'
import { Outlet, NavLink } from 'react-router-dom'
import { AppLinks } from 'common/AppLinks'
import { Tree, TreeNodeTemplateOptions } from 'primereact/tree'


import './AdminPanel.scss'



export const MainAdminPanelView = () => {

   const mainAdminPanelOptions = [
      {
         key: '0',
         label: 'Użytkownicy',
         icon: 'pi pi-fw pi-user',
         className: "admin-panel-option-main-option-wrapper",
         children: [
             {
                 key: '0-0',
                 label: 'Dodaj użytkownika',
                 icon: 'pi pi-fw pi-user-plus',
                 url: AppLinks.adminPanelAddUser,
             },
             {
                 key: '0-1',
                 label: 'Wszyscy użytkownicy',
                 icon: 'pi pi-fw pi-user-edit',
                 url: AppLinks.adminPanelAllUsers,
             }
         ]
      },
      {
         key: '1',
         label: 'Projekty',
         icon: 'pi pi-fw pi-briefcase',
         className: "admin-panel-option-main-option-wrapper",
         children: [
             {
                 key: '1-0',
                 label: 'Dodaj projekt',
                 icon: 'pi pi-fw pi-plus',
                 url: AppLinks.adminPanelAddProject,
             },
             {
                 key: '1-1',
                 label: 'Edytuj projekty',
                 icon: 'pi pi-fw pi-pencil',
                 url: AppLinks.adminPanelEditProject,
             }
         ]
      }
   ]
   const nodeTemplate = (node: any, options: TreeNodeTemplateOptions) => {
      let label = <span className="admin-panel-option">{node.label}</span>;
      

      if (node.url) {
         label = <NavLink to={node.url} className="admin-panel-option">{node.label}</NavLink>;
      }

      return <span className={options.className}>{label}</span>
   }

   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.adminPanel} underline="hover" color='inherit'>Panel administracyjny</Link>
         </Breadcrumbs>
         <Tree value={mainAdminPanelOptions} nodeTemplate={nodeTemplate} />
      </>
   )
}


const AdminPanel = () => {
   return (
      <div className='admin-pannel-outer-wrapper'>
         <header className='admin-panel-header-wrapper'>
            <TuneOutlinedIcon />
            <h1>Panel administracyjny</h1>
         </header>
         <section className='admin-pannel-content-section-outer-wrapper'>
            <Outlet />
         </section>
      </div>
   )
}

export default AdminPanel
