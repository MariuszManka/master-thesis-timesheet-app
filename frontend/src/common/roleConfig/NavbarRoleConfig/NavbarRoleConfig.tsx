import { AppLinks } from 'common/AppLinks'
import { NavLink } from 'react-router-dom'

import { ReactComponent as  NavbarHomeIcon } from 'assets/icons/navbar-home-icon.svg'
import { ReactComponent as  NavbarProjectsIcon } from 'assets/icons/navbar-projects-icon.svg'
import { ReactComponent as  NavbarTimesheetIcon } from 'assets/icons/navbar-timesheet-icon.svg'
import { ReactComponent as  NavbarTeamIcon } from 'assets/icons/navbar-team-icon.svg'
import { ReactComponent as  NavbarAdminPanelIcon } from 'assets/icons/navbar-admin-panel.svg'
import { SystemRoles } from '../globalRoleConfig'


import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
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
   projects: (
      <NavLink to={AppLinks.projects} className="page-navbar-link-item-wrapper" key={2}>
         <li>
            <AssessmentRoundedIcon />
            <p>Projekty</p>
         </li>
      </NavLink>
   ),
   timesheet: (
      <NavLink to={AppLinks.timesheet} className="page-navbar-link-item-wrapper" key={3}>
         <li>
            <PendingActionsRoundedIcon />
            <p>Timesheet</p>
         </li>
      </NavLink>
   ),
   teams: (
      <NavLink to={AppLinks.teams} className="page-navbar-link-item-wrapper" key={4}>
         <li>
            <PeopleAltRoundedIcon />
            <p>Zespół</p>
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
   [SystemRoles.ADMIN]: [AllNavbarItems.profile, AllNavbarItems.admin],
   // [SystemRoles.ADMIN]: [AllNavbarItems.home, AllNavbarItems.projects, AllNavbarItems.timesheet, AllNavbarItems.teams],
   [SystemRoles.MANAGER]: [AllNavbarItems.home, AllNavbarItems.projects, AllNavbarItems.timesheet, AllNavbarItems.teams],
   [SystemRoles.EMPLOYEE]: [AllNavbarItems.home, AllNavbarItems.projects, AllNavbarItems.timesheet, AllNavbarItems.teams, AllNavbarItems.profile]
}