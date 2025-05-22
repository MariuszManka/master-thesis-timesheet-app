import React from 'react';

import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { Breadcrumbs, Card, CardActionArea, CardContent, CardMedia, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { Outlet, NavLink } from 'react-router-dom'
import { AppLinks } from 'common/AppLinks'
import { Tree, TreeNodeTemplateOptions } from 'primereact/tree'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CreateNewFolderOutlined from '@mui/icons-material/CreateNewFolderOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';


import './AdminPanelStyles.scss'




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
         {/* <PanelMenu model={mainAdminPanelOptions} multiple /> */}
         <div className='admin-panel-admin-cards-outer-wrapper'>
            <List className={`admin-panel-single-card-content-outer-wrapper`}>
               <ListItem className='admin-panel-admin-cards-list-heading' divider>
               <PersonOutlineIcon  style={{ marginRight: 10 }}/>
                  Akcje użytkowników
               </ListItem>
               <Link href={AppLinks.adminPanelAddUser} style={{ width: '100%', textDecoration: 'none'}}>
                  <ListItemButton className='admin-panel-admin-cards-list-item'>
                     <ListItemIcon>
                        <PersonAddOutlinedIcon/>
                     </ListItemIcon>
                     <ListItemText>
                        Dodaj użytkownika
                     </ListItemText>
                  </ListItemButton>
               </Link>
               <Link href={AppLinks.adminPanelAllUsers} style={{ width: '100%', textDecoration: 'none'}}>
                  <ListItemButton className='admin-panel-admin-cards-list-item'>
                     <ListItemIcon>
                        <GroupOutlinedIcon />
                     </ListItemIcon>
                     <ListItemText>
                        Wszyscy użytkownicy
                     </ListItemText>
                  </ListItemButton>              
               </Link>
            </List>
            <List className={`admin-panel-single-card-content-outer-wrapper`}>
               <ListItem className='admin-panel-admin-cards-list-heading' divider>
                  <FolderOutlinedIcon style={{ marginRight: 10 }}/>
                  Akcje projektów
               </ListItem>
               <Link href={AppLinks.adminPanelAddProject} style={{ width: '100%', textDecoration: 'none'}}>
                  <ListItemButton className='admin-panel-admin-cards-list-item'>
                     <ListItemIcon>
                        <CreateNewFolderOutlined />
                     </ListItemIcon>
                     <ListItemText>
                        Dodaj projekt
                     </ListItemText>
                  </ListItemButton>
               </Link>
               <Link href={AppLinks.projects} style={{ width: '100%', textDecoration: 'none'}}>
                  <ListItemButton className='admin-panel-admin-cards-list-item'>
                     <ListItemIcon>
                        <FolderCopyOutlinedIcon />
                     </ListItemIcon>
                     <ListItemText>
                        Wszystkie projekty
                     </ListItemText>
                  </ListItemButton>              
               </Link>
            </List>
            <List className={`admin-panel-single-card-content-outer-wrapper`}>
               <ListItem className='admin-panel-admin-cards-list-heading' divider>
                  <AddTaskOutlinedIcon style={{ marginRight: 10 }}/>
                  Akcje zadań
               </ListItem>
               <Link href={AppLinks.adminPanelAddTask} style={{ width: '100%', textDecoration: 'none'}}>
                  <ListItemButton className='admin-panel-admin-cards-list-item'>
                     <ListItemIcon>
                        <TaskAltOutlinedIcon />
                     </ListItemIcon>
                     <ListItemText>
                        Dodaj zadanie
                     </ListItemText>
                  </ListItemButton>
               </Link>
               <Link href={AppLinks.adminPanelViewAllTasks} style={{ width: '100%', textDecoration: 'none'}}>
                  <ListItemButton className='admin-panel-admin-cards-list-item'>
                     <ListItemIcon>
                        <DoneAllOutlinedIcon />
                     </ListItemIcon>
                     <ListItemText>
                        Wszystkie zadania
                     </ListItemText>
                  </ListItemButton>              
               </Link>
            </List>
         </div>
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
