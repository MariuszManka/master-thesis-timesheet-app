import React, { act, useEffect, useState } from 'react';

import './ProfilePageStyles.scss'
import { useDispatch, useSelector } from 'react-redux'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

import { AppState } from 'store'
import { Breadcrumbs, Button, Link } from '@mui/material'
import { AppLinks } from 'common/AppLinks'
import { TabPanel, TabView } from 'primereact/tabview'
import { IProfilPageUserAvatarPanelProps } from './ProfilPageProps'
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload'
import authService, { IPartialSingleUserDataModel, IUpdateUserAddress } from 'services/AuthService/AuthService'
import { setCurrentUserData, setNewUserAvatar, setUserAddresses } from 'store/CurrentUserSlice/CurrentUserSlice'
import { useSnackbar } from 'notistack'
import { ISingleUserDataModel, IUserAddressesFormDataModel, IUserAddressesModel } from 'store/admin/AdminPanelSlice/AdminPanelSlice'
import usePersistedState from 'common/hooks/usePersistedState'
import { InputText } from 'primereact/inputtext'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { addressesFieldsNames, mapRoleToName, profileFieldsEditPrivilegesByRole, profileFieldsNames, rolesDropdownOptions, SystemRoles } from 'common/roleConfig/globalRoleConfig'
import { InputSwitch } from 'primereact/inputswitch'
import { Divider } from 'primereact/divider'
import { ScrollPanel } from 'primereact/scrollpanel'
import { InputMask } from "primereact/inputmask";
import { CustomAxiosErrorResponse } from 'common/HttpClient'
import { Fieldset } from 'primereact/fieldset'




const ProfilPageEditUserMainPanel = (props: { userData: ISingleUserDataModel }) => {
   // =============== PRZYWRÓCIĆ GDY POTRZEBNY BĘDZIE STAŁY STAN =============== 
      // const [currentFormValues, setCurrentFormValues] = usePersistedState('USER_PROFIL_FORM', {
      //    [profileFieldsNames.EMAIL]: props.userData.email ?? '',
      //    [profileFieldsNames.FULL_NAME]: props.userData.user_info.full_name ?? '',
      //    [profileFieldsNames.ROLE]: { name: mapRoleToName(props.userData.role), value: props.userData.role },
      //    [profileFieldsNames.POSITION]: props.userData.user_info.position ?? '',
      //    [profileFieldsNames.PHONE]: props.userData.user_info.phone ?? '',
      //    [profileFieldsNames.ACTIVE]: props.userData.active,
      // })
   // ============================================================================

   const { userData } = props
   const dispatch = useDispatch()
   const { enqueueSnackbar } = useSnackbar()
   // @ts-ignore
   const currentRoleEditPrivileges = profileFieldsEditPrivilegesByRole[userData.role]

   const [afterFirstChange, setIsAfterFirstChange] = useState(false)
   const [updatedFields, setUpdatedFields] = useState<Partial<ISingleUserDataModel>>({})
   const [specificHandlingFields, setSpecificHandlingFields] = useState<Record<string, any>>({
      isUserActive: userData.active,
      currentUserRole: userData.role,
      phone: userData.user_info.phone,
   })

   const handleUpdateSelectedField = <T extends keyof ISingleUserDataModel>(fieldName: T, value: any, subFieldName?: keyof ISingleUserDataModel[T]) => {
      if (!afterFirstChange) {
         setIsAfterFirstChange(true);
      }
   
      setUpdatedFields((prev) => {
         if (subFieldName) {
            // Handle nested fields like `user_info.phone`
            return {
               ...prev,
               [fieldName]: {
                  ...(prev[fieldName] as any || {}),
                  [subFieldName]: value,
               },
            }
         }
   
         return { ...prev, [fieldName]: value }  // Handle top-level fields like `email`
      })
   }


   const handleOnUpdateCommit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (Object.keys(updatedFields).length === 0) {
         return
      }

      try {
         const updatedCurrentUserData = await authService.updateCurrentUser({ updatedUserData: updatedFields as IPartialSingleUserDataModel,currentUserId: userData.id})
   
         dispatch(setCurrentUserData(updatedCurrentUserData))
         setIsAfterFirstChange(false)
         setUpdatedFields({})

         enqueueSnackbar("Dane użytkownika zostały poprawnie zaktualizowane", { variant: 'success', autoHideDuration: 5000 })
      }

      catch (error: any) {
         if(error instanceof CustomAxiosErrorResponse) {
            enqueueSnackbar(`Błąd podczas aktualizacji danych użytkownika: ${ error.message }`, { variant: 'error', autoHideDuration: 5000 })
         }
      }
   }

   return (
         <form className='profile-page-form-wrapper' onSubmit={handleOnUpdateCommit}>
            <div className='profile-form-input-wrapper'>
               <label htmlFor='ProfilFullName'>Imię i nazwisko</label>
               <InputText
                  unstyled
                  name={profileFieldsNames.FULL_NAME}
                  disabled={!currentRoleEditPrivileges.includes(profileFieldsNames.FULL_NAME)}
                  id="ProfilFullName"
                  className='profil-form-input'
                  defaultValue={userData.user_info.full_name}
                  onChange={(e) => handleUpdateSelectedField('user_info', e.target.value, 'full_name')}
                  type="text"
               />
            </div>
            <div className='profile-form-input-wrapper'>
               <label htmlFor='ProfilEmail'>Email</label>
               <InputText
                  unstyled
                  name={profileFieldsNames.EMAIL}
                  disabled={!currentRoleEditPrivileges.includes(profileFieldsNames.EMAIL)}
                  id="ProfilEmail"
                  className='profil-form-input'
                  defaultValue={userData.email}
                  onChange={(e) => handleUpdateSelectedField('email', e.target.value)}       
                  type="text"
               />
            </div>
            <div className='profile-form-input-wrapper'>
               <label htmlFor='ProfilRole'>Rola</label>
               <Dropdown
                  id="ProfilRole"
                  name={profileFieldsNames.ROLE}
                  disabled={!currentRoleEditPrivileges.includes(profileFieldsNames.ROLE)}
                  optionLabel="name"
                  value={specificHandlingFields.currentUserRole}
                  onChange={(e: DropdownChangeEvent) => {
                     setSpecificHandlingFields({...specificHandlingFields, currentUserRole: e.value})
                     handleUpdateSelectedField('role', e.value)}
                  } 
                  options={rolesDropdownOptions}
                  placeholder="Wybierz rolę"
                  className='profil-form-input profil-form-dropdown-input'
               />
            </div>
            <div className='profile-form-input-wrapper'>
               <label htmlFor='ProfilPosition'>Stanowisko</label>
               <InputText
                  unstyled
                  name={profileFieldsNames.POSITION}
                  disabled={!currentRoleEditPrivileges.includes(profileFieldsNames.POSITION)}
                  id="ProfilPosition"
                  className='profil-form-input'
                  defaultValue={userData.user_info.position}
                  onChange={(e) => handleUpdateSelectedField('user_info', e.target.value, 'position')}         
                  type="text"
               />
            </div>
            <div className='profile-form-input-wrapper'>
               <label htmlFor='ProfilPhone'>Telefon</label>
               <InputMask
                  unstyled
                  name={profileFieldsNames.PHONE}
                  disabled={!currentRoleEditPrivileges.includes(profileFieldsNames.PHONE)}
                  id="ProfilPhone"
                  className='profil-form-input'
                  value={specificHandlingFields.phone ?? ''}
                  placeholder='+48'
                  onChange={(e) => {
                     setSpecificHandlingFields({...specificHandlingFields, phone: e.target.value})
                     handleUpdateSelectedField('user_info', e.target.value, 'phone')}          
                  }
                  type="text"
                  mask={"+48 999 999 999"}
               />
            </div>
            <div className="profile-form-switch-wrapper">
               <label htmlFor="ProfileIsActive" className="profile-form-label">Czy użytkownik jest aktywny?</label>
               <InputSwitch
                  name={profileFieldsNames.ACTIVE}
                  disabled={!currentRoleEditPrivileges.includes(profileFieldsNames.ACTIVE)}
                  id="ProfileIsActive"
                  checked={specificHandlingFields.isUserActive}
                  onChange={(e) => {
                     setSpecificHandlingFields({...specificHandlingFields, isUserActive: e.value})
                     handleUpdateSelectedField('active', e.value)
                  }}
               />
            </div>
            <Button disabled={!afterFirstChange} className="profile-form-update-submit-button" variant="contained" type="submit">
               Aktualizuj dane
            </Button>
         </form>
      
   )
}


const ProfilPageEditUserAddressesPanel = (props: { userAddresses: IUserAddressesModel[] }) => {
   const { enqueueSnackbar } = useSnackbar()
   const dispatch = useDispatch()

   const { userAddresses } = props
   const [afterFirstChange, setIsAfterFirstChange] = useState(false)
   const [isFormalUpdated, setIsFormalUpdated] = useState(false)
   const [isCorrespondenceUpdated, setIsCorrespondenceUpdated] = useState(false)
   const [updatedFields, setUpdatedFields] = useState<{formal?: Partial<IUserAddressesModel>, correspondence?: Partial<IUserAddressesModel>}>({})

   const initialFormData: IUserAddressesFormDataModel = {
      formal: userAddresses.find(a => a.address_type === "Formalny")!,
      correspondence: userAddresses.find(a => a.address_type === "Korespondencyjny")!,
   }
   
   const [formData, setFormData] = useState<IUserAddressesFormDataModel>(initialFormData)

   const handleInputChange = (addressType: keyof IUserAddressesFormDataModel, field: keyof IUserAddressesModel, value: string) => {
      setFormData(prev => ({ 
         ...prev, [addressType]: { ...prev[addressType], [field]: value }
      }))

      setIsAfterFirstChange(true)
      
      setUpdatedFields(prev => ({
         ...prev, [addressType]: { ...prev[addressType], [field]: value }
      }))

      if (addressType === "formal") {
         setIsFormalUpdated(true)
      }
      if (addressType === "correspondence") {
         setIsCorrespondenceUpdated(true)
      }
   }

   const renderAddressFieldset = (type: "Formalny" | "Korespondencyjny") => {
      const label = type === "Formalny" ? "formal" : "correspondence"
      const data = formData[label as keyof IUserAddressesFormDataModel]
   

      return (
         <Fieldset key={type} toggleable legend={`Adres ${type}`} className='addresses-form-inner-input-wrapper'>
            <div className='profile-form-input-wrapper'>
               <label htmlFor={addressesFieldsNames.CITY}>Miasto</label>
               <InputText
                  name={addressesFieldsNames.CITY}
                  id={addressesFieldsNames.CITY}
                  className='profil-form-input'
                  value={data.city ?? ''}
                  onChange={e => handleInputChange(label, 'city', e.target.value)}       
                  type="text"
               />
            </div>
            <div className='profile-form-input-wrapper'>
               <label htmlFor={addressesFieldsNames.STREET}>Ulica</label>
               <InputText
                  name={addressesFieldsNames.STREET}
                  id={addressesFieldsNames.STREET}
                  className='profil-form-input'
                  value={data.street ?? ''}
                  onChange={e => handleInputChange(label, 'street', e.target.value)}       
                  type="text"
               />
            </div>
            <div className='profile-form-input-wrapper'>
               <label htmlFor={addressesFieldsNames.POSTAL_CODE}>Kod pocztowy</label>
               <InputMask
                  name={addressesFieldsNames.POSTAL_CODE}
                  id={addressesFieldsNames.POSTAL_CODE}
                  className='profil-form-input'
                  value={data.postal_code ?? ''}
                  mask="99-999"
                  placeholder='__-___'
                  onChange={e => handleInputChange(label, 'postal_code', e.target.value ?? '')}       
                  type="text"
               />
            </div>
            <div className='profile-form-input-wrapper'>
               <label htmlFor={addressesFieldsNames.HOUSE_NUMBER}>Numer domu</label>
               <InputText
                  name={addressesFieldsNames.HOUSE_NUMBER}
                  id={addressesFieldsNames.HOUSE_NUMBER}
                  className='profil-form-input'
                  value={data.house_number ?? ''}
                  onChange={e => handleInputChange(label, 'house_number', e.target.value ?? '')}       
                  type="text"
                  maxLength={4}
               />
            </div>
            <div className='profile-form-input-wrapper'>
               <label htmlFor={addressesFieldsNames.FLAT_NUMBER}>Numer mieszkania</label>
               <InputText
                  name={addressesFieldsNames.FLAT_NUMBER}
                  id={addressesFieldsNames.FLAT_NUMBER}
                  className='profil-form-input'
                  value={data.flat_number ?? ''}
                  maxLength={4}
                  onChange={e => handleInputChange(label, 'flat_number', e.target.value ?? '')}       
                  type="text"
               />
            </div>
         </Fieldset>
      )
   }

   const handleOnUpdateCommit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!afterFirstChange) return

      try {
         // Tylko te adresy, które zostały zaktualizowane
         const updatesToSend: IUpdateUserAddress[] = []

         if (isFormalUpdated) {
            updatesToSend.push({
               ...formData.formal, id: formData.formal.id
            })
         }

         if (isCorrespondenceUpdated) {
            updatesToSend.push({
               ...formData.correspondence, id: formData.correspondence.id
            })
         }

         // Jeśli są jakieś zmiany, wysyłamy do API
         for (const update of updatesToSend) {
            const updatedUserAddresses = await authService.updateUserAddress(update)
            dispatch(setUserAddresses(updatedUserAddresses))
         }

         if (updatesToSend.length > 0) {
            enqueueSnackbar("Dane użytkownika zostały poprawnie zaktualizowane", { variant: 'success', autoHideDuration: 5000 })
            setIsAfterFirstChange(false)
         } 
      } 
      catch (error: any) {
         enqueueSnackbar(`Błąd podczas aktualizacji danych użytkownika: ${ error.message }`, { variant: 'error', autoHideDuration: 5000 })
      }
   }


   return (
         <form className='profile-page-form-wrapper addresses-form-wrapper' onSubmit={handleOnUpdateCommit}>
            {
               ["Formalny", "Korespondencyjny"].map(type => renderAddressFieldset(type as "Formalny" | "Korespondencyjny"))
            }
            <Button disabled={!afterFirstChange} className="profile-form-update-submit-button" variant="contained" type="submit">
               Aktualizuj dane
            </Button>
         </form>
   )
}



const ProfilPageEditUserInfoPanel = (props: { userData: ISingleUserDataModel }) => {
   return (
      <div className='card profil-page-content-info-panel'>
         <TabView>
            <TabPanel header="Ogólne" >
               <ScrollPanel style={{ height: 500, padding: '0 15px' }}>
                  <ProfilPageEditUserMainPanel userData={props.userData}/>
               </ScrollPanel>
            </TabPanel>
            <TabPanel header="Adresy" >
               <ScrollPanel style={{ height: 500, padding: '0 15px' }}>
                  <ProfilPageEditUserAddressesPanel userAddresses={props.userData.user_addresses} />
               </ScrollPanel>
            </TabPanel>
         </TabView>
      </div>
   )
}

const ProfilPageUserAvatarPanel = (props: IProfilPageUserAvatarPanelProps) => {
   const dispatch = useDispatch()
   const { enqueueSnackbar } = useSnackbar()

   const currentUserAvatar = props.avatar === null ? `https://avatar.iran.liara.run/username?&username=${props.fullName.trim().split(" ").join("+")}` :
         `data:image/jpeg;base64, ${props.avatar}`


   const handleOnFileUpload = async(event: FileUploadHandlerEvent) => {
      const uploadAvatarResponse = await authService.uploadUserAvatar(event.files[0], props.currentUserId)
      dispatch(setNewUserAvatar(uploadAvatarResponse.avatarBase64))

      enqueueSnackbar(`Awatar użytkownika został zaktualizowany`, { variant: 'success', autoHideDuration: 5000 })
      event.options.clear()
   }

   return (
      <div className='card profil-page-content-avatar-panel'>
         <div className='profil-page-content-avatar-panel-user-avatar-wrapper'>
            <img src={currentUserAvatar} alt={props.fullName.slice(0, 2)} />
            <FileUpload 
               mode="basic" accept="image/*" auto 
               customUpload uploadHandler={handleOnFileUpload}
               chooseOptions={{ icon: 'pi pi-fw pi-camera', iconOnly: true, className: 'p-button-rounded profil-page-content-avatar-panel-file-upload-button' }}
            />
         </div>
         <h4>{props.fullName}</h4>
         <p style={{ marginBottom: 20 }}>{props.position}</p>
         <Divider />
         <div className='profil-page-content-avatar-panel-user-statistic-wrapper'>
            <p>Przypisane zadania: </p>
            <p className='profil-page-content-avatar-panel-user-statistic-number'>{props.assignedTasksNumber}</p>
         </div>
         <Divider />
         <div className='profil-page-content-avatar-panel-user-statistic-wrapper'>
            <p>Przepracowane dni: </p>
            <p className='profil-page-content-avatar-panel-user-statistic-number'>176</p>
         </div>
         <Divider />
      </div>
   )
}

const ProfilPageContent = () => {
   const currentUserData = useSelector((state: AppState) => state.currentUserState)

   const { user_info, associated_tasks } = currentUserData

   return (
      <>
         <Breadcrumbs aria-label="breadcrumb" style={{ marginLeft: 5, cursor: 'pointer' }}>
            <Link href={AppLinks.profile} underline="hover" color='inherit'>Profil użytkownika</Link>
         </Breadcrumbs>
         <div className='profil-page-content-inner-wrapper'>
            <ProfilPageUserAvatarPanel 
               fullName={user_info.full_name} 
               avatar={user_info.avatar} 
               currentUserId={currentUserData.id} 
               position={user_info.position} 
               assignedTasksNumber={associated_tasks.length} 
            />
            <ProfilPageEditUserInfoPanel userData={currentUserData} />
         </div>
      </>
   )
}

const ProfilePage = () => {
   return (
      <div className='profil-page-outer-wrapper'>
         <header className='profil-page-header-wrapper'>
            <ManageAccountsIcon />
            <h1>Profil użytkownika</h1>
         </header>
         <section className='admin-pannel-content-section-outer-wrapper'>
            <ProfilPageContent />
         </section>
      </div>
   )
}

export default ProfilePage
