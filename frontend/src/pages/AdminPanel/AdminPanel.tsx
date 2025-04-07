import React from 'react';

import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { Breadcrumbs, Link } from '@mui/material'
import { Outlet, NavLink } from 'react-router-dom'
import { AppLinks } from 'common/AppLinks'
import { Tree, TreeNodeTemplateOptions } from 'primereact/tree'


import './AdminPanelStyles.scss'
import { PanelMenu } from 'primereact/panelmenu'




export const MainAdminPanelView = () => {

   const mainAdminPanelOptions = [
      {
         key: '0',
         label: 'Użytkownicy',
         icon: 'pi pi-fw pi-user',
         className: "admin-panel-option-main-option-wrapper",
         items: [
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
         label: 'Zadania',
         icon: 'pi pi-fw pi-briefcase',
         className: "admin-panel-option-main-option-wrapper",
         items: [
             {
                 key: '1-0',
                 label: 'Dodaj zadanie',
                 icon: 'pi pi-fw pi-plus',
                 url: AppLinks.adminPanelAddTask,
             },
             {
                 key: '1-1',
                 label: 'Wszystkie zadania',
                 icon: 'pi pi-fw pi-pencil',
                 url: AppLinks.adminPanelViewAllTasks,
             }
         ]
      }
   ]

   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.adminPanel} underline="hover" color='inherit'>Panel administracyjny</Link>
         </Breadcrumbs>
         <PanelMenu model={mainAdminPanelOptions} multiple />
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
