import React, { useEffect, useRef, useState } from 'react'
import { Breadcrumbs, Link } from '@mui/material'

import { AppLinks } from 'common/AppLinks'
import { DataTable, DataTableDataSelectableEvent, DataTableFilterMeta } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from 'store'
import authService from 'services/AuthService/AuthService'
import { ISingleUserDataModel, setAllUsersList } from 'store/admin/AdminPanelSlice/AdminPanelSlice'
import { mapRoleToName, SystemRoles } from 'common/roleConfig/globalRoleConfig'
import { FilterMatchMode } from 'primereact/api'
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { sleep } from 'common/helpers/helpers'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'


import './AdminPanelViewAllUsersStyles.scss'


const AdminPanelViewAllUsers = () => {
   const DATA_SLEEP_TIME = 2000

   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { enqueueSnackbar } = useSnackbar()
   
   const [selectedUserRows, setSelectedUserRows] = useState<ISingleUserDataModel[]>([]);
   const [isLoading, setIsLoading] = useState(false)
   const [isDialogVisible, setIsDialogVisible] = useState(false)
   const [globalFilterValue, setGlobalFilterValue] = useState('')
   
   const allUsersList = useSelector((state: AppState) => state.adminPanelState.allUsersList)
   const currentLoggedUserId = useSelector((state: AppState) => state.currentUserState.id)
   const [filters, setFilters] = useState<DataTableFilterMeta>({ global: { value: null, matchMode: FilterMatchMode.CONTAINS }})
   // Funkcja mówiąca o tym czy można wybrać dany wiersz. Zabezpieczenie przed usunięciem swojego własnego konta
   const isRowSelectable = (event: DataTableDataSelectableEvent) => (event.data.id !== currentLoggedUserId)


   useEffect(() => {
      (async () => {
         try {
            setIsLoading(true)
            const allUsersListFromFetched = await authService.getAllUsersAccounts()
            dispatch(setAllUsersList(allUsersListFromFetched))
                     
            await sleep(DATA_SLEEP_TIME)
            setIsLoading(false)
         }
         catch (e: any) {
            enqueueSnackbar(`Nie udało się odczytać listy użytkowników z bazy danych.`, { variant: 'error', autoHideDuration: 5000, preventDuplicate: true })
            navigate(AppLinks.adminPanel)
         }
      })()
   }, [])


   // Funkcja obsługująca kontrolkę z filtrowaniem danych z tabeli
   const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      let _filters = { ...filters }

      // @ts-ignore
      _filters['global'].value = value

      setFilters(_filters);
      setGlobalFilterValue(value)
   }

   const handleOnDeleteSelectedRows = async () => {
      try {
         for (const selectedUserRow of selectedUserRows) {
            authService.deleteSelectedUser(selectedUserRow.id)
            enqueueSnackbar(`Poprawnie usunięto użytkownika ${selectedUserRow.email}`, { variant: 'success', autoHideDuration: 5000 })
         }

         setIsDialogVisible(false)
         setSelectedUserRows([])

         const allUsersListFromFetched = await authService.getAllUsersAccounts()
         console.log("REFRESH: ", allUsersListFromFetched)
         dispatch(setAllUsersList(allUsersListFromFetched))

         setIsLoading(false)
      }
      catch (e: any){
         enqueueSnackbar(`Nie udało się usunąć użytkownika z bazy danych.`, { variant: 'error', autoHideDuration: 5000, preventDuplicate: true })
         setIsDialogVisible(false)
         setSelectedUserRows([])
      }
   }


   const renderHeader = () => {
     return (
         <>
            <div style={{ display: "flex", justifyContent: 'space-between', }}>
            <Button label="Usuń" icon="pi pi-trash" severity="danger" onClick={() => setIsDialogVisible(true)} />
               <IconField iconPosition="left">
                  <InputIcon className="pi pi-search" />
                  <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Szukaj" />
               </IconField>
            </div>
         </>
     )
   } 

   const fullNameBodyTemplate = (rowData: ISingleUserDataModel) => {
      const userAvatar = rowData.user_info.avatar === null ? 
         `https://avatar.iran.liara.run/username?&username=${rowData.user_info.full_name.trim().split(" ").join("+")}` :
         `data:image/jpeg;base64, ${rowData.user_info.avatar}`

      return (
          <div className="admin-page-view-all-users-full-name-body-wrapper">
              <img alt={rowData.user_info.full_name.slice(0, 2)} src={userAvatar} width="32" />
              <span>{rowData.user_info.full_name}</span>
          </div>
      )
  };

   const verifiedColumnBodyTemplate = (rowData: ISingleUserDataModel) => {
      return rowData.active?  
            <i className='pi pi-check-circle' style={{ color: '#027202', width: 45, display: 'block', textAlign: 'center' }} /> : 
            <i className='pi pi-times-circle' style={{ color: '#e01414', width: 45, display: 'block', textAlign: 'center'}} />
   }

   const dialogFooterContent = (
      <div>
          <Button label="Tak" icon="pi pi-check" onClick={() => handleOnDeleteSelectedRows()} autoFocus className='admin-page-delete-user-modal-button agree-button'/>
          <Button label="Nie" icon="pi pi-times" onClick={() => setIsDialogVisible(false)} className="admin-page-delete-user-modal-button disagree-button" />
      </div>
   )

   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.adminPanel} underline="hover" color="inherit">
               Panel administracyjny
            </Link>
            <Link href={AppLinks.adminPanelAllUsers} underline="hover" color="inherit">
               Wszyscy użytkownicy
            </Link>
         </Breadcrumbs>
         <div className="card">
            <DataTable className='admin-page-view-all-users-table-wrapper'
               selection={selectedUserRows} onSelectionChange={(e) => setSelectedUserRows(e.value)} selectionMode="multiple" isDataSelectable={isRowSelectable}
               filters={filters} sortField="id" sortOrder={-1}
               dataKey="id" size='normal'
               scrollable scrollHeight="65vh"
               value={allUsersList} loading={isLoading}
               globalFilterFields={['id', 'user_info.full_name', 'user_info.position', 'email', 'role']} header={renderHeader()}
            >
               <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>

               <Column field="id" header="Id" sortable style={{ width: 120 }}></Column>
               <Column field="user_info.full_name" header="Imię i nazwisko" body={fullNameBodyTemplate}></Column>
               <Column field="user_info.position" header="Stanowisko" ></Column>
               <Column field="email" header="Adres e-mail"></Column>
               <Column field="role" header="Rola" body={(rowData: ISingleUserDataModel) => mapRoleToName(rowData.role)}></Column>
               <Column field="active" header="Aktywny?" style={{ width: 45 }}  dataType='boolean' body={verifiedColumnBodyTemplate}></Column>
            </DataTable>
          </div>
          <Dialog header="Potwierdź akcję" visible={isDialogVisible} style={{ width: '35vw' }} onHide={() => setIsDialogVisible(false)} footer={dialogFooterContent}>
               Czy na pewno chcesz usunąć użytkowników: <br />
               <b>{selectedUserRows.map(x => x.email).join(', ')}</b>?
          </Dialog>
      </>
   )
}

export default AdminPanelViewAllUsers