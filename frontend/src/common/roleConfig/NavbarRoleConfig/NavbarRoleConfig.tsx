import { AppLinks } from 'common/AppLinks'
import { NavLink } from 'react-router-dom'
import { SystemRoles } from '../globalRoleConfig'


import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
// import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ScheduleSendOutlinedIcon from '@mui/icons-material/ScheduleSendOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

const AllNavbarItems = {
   home: (
      <NavLink to={AppLinks.home} className="page-navbar-link-item-wrapper" key={1}>
         <li>
            <HomeRoundedIcon />
            <p>Panel główny</p>
         </li>
      </NavLink>
   ),
   tasks: (
      <NavLink to={AppLinks.tasks} className="page-navbar-link-item-wrapper" key={2}>
         <li>
            <TaskAltIcon />
            <p>Zadania</p>
         </li>
      </NavLink>
   ),
   timesheet: (
      <NavLink to={AppLinks.timesheet} className="page-navbar-link-item-wrapper" key={3}>
         <li>
            <ScheduleSendOutlinedIcon />
            <p>Timesheet</p>
         </li>
      </NavLink>
   ),
   projects: (
      <NavLink to={AppLinks.projects} className="page-navbar-link-item-wrapper" key={4}>
         <li>
            <AssignmentOutlinedIcon />
            <p>Projekty</p>
         </li>
      </NavLink>
   ),
   profile: (
      <NavLink to={AppLinks.profile} className="page-navbar-link-item-wrapper" key={5}>
      <li>
         <ManageAccountsIcon />
         <p>Profil</p>
      </li>
   </NavLink>
   ),
   admin: (
      <NavLink to={AppLinks.adminPanel} className="page-navbar-link-item-wrapper" key={6}>
         <li>
            <TuneOutlinedIcon />
            <p>Administracja</p>
         </li>
      </NavLink>
   )
}


export const RoleBasedNavbarItems = {
   [SystemRoles.ADMIN]: [AllNavbarItems.admin, AllNavbarItems.projects, AllNavbarItems.tasks, AllNavbarItems.profile],
   // [SystemRoles.ADMIN]: [AllNavbarItems.home, AllNavbarItems.tasks, AllNavbarItems.timesheet, AllNavbarItems.teams],
   [SystemRoles.MANAGER]: [AllNavbarItems.projects, AllNavbarItems.tasks, AllNavbarItems.timesheet,  AllNavbarItems.profile],
   [SystemRoles.EMPLOYEE]: [AllNavbarItems.projects, AllNavbarItems.tasks, AllNavbarItems.timesheet, AllNavbarItems.profile]
}