import React, { useState } from 'react'
import * as Yup from 'yup'
import { Button } from '@mui/material'
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown'
import { useSnackbar } from 'notistack'
import { InputSwitch } from 'primereact/inputswitch'
import { useNavigate } from 'react-router-dom'

import usePersistedState from 'common/hooks/usePersistedState'
import { rolesDropdownOptions, SystemRoles } from 'common/roleConfig/globalRoleConfig'
import authService from 'services/AuthService/AuthService'
import { CustomAxiosErrorResponse } from 'common/HttpClient'
import { AppLinks } from 'common/AppLinks'

import '../FormStyles.scss'


const UserForm = () => {
   const { enqueueSnackbar } = useSnackbar()
   const navigate = useNavigate()

   const [currentFormValues, setCurrentFormValues] = usePersistedState('ADD_USER_FORM', {
      email: '',
      fullName: '',
      position: '',
      active: true,
      role: { name: '', value: SystemRoles.DEFAULT }
   })

   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

   const addUserYupValidationSchema = Yup.object().shape({
      email: Yup.string().email("Niepoprawny adres email").required("Uzupełnij pole"),
      fullName: Yup.string().required("Uzupełnij pole"),
      position: Yup.string().required("Uzupełnij pole"),
      role: Yup.object().shape({
         name: Yup.string().required("Wybierz wartość"),
         value: Yup.string().required("Wybierz wartość")
      }),
   })

   
   const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      addUserYupValidationSchema
         .validate(currentFormValues, { abortEarly: false })
         .then(async() => {
            try {
               const createdUser = await authService.createUserAccount({
                  email: currentFormValues.email,
                  full_name: currentFormValues.fullName,
                  position: currentFormValues.position,
                  role: currentFormValues.role.value,
                  active: currentFormValues.active,
               })

               enqueueSnackbar(`Poprawnie dodano użytkownika ${createdUser.email}`, { variant: 'success', autoHideDuration: 5000 })
               setValidationErrors({}) // Czyszczenie błędów
               setCurrentFormValues({ email: '', fullName: '', position: '', active: true, role: { name: '', value: SystemRoles.DEFAULT } }) // Czyszczenie formularza

               navigate(AppLinks.adminPanelAllUsers)
            }
            catch (error: any) {
               if(error instanceof CustomAxiosErrorResponse) {
                  setCurrentFormValues({ email: '', fullName: '', position: '', active: true, role: { name: '', value: SystemRoles.DEFAULT } }) // Czyszczenie formularza
                  setValidationErrors({email: "Podaj inny adres email", role: "Wybierz rolę"})
                  enqueueSnackbar(`Błąd podczas dodawania użytkownika: ${error.message ?? ""}`, { variant: 'error', autoHideDuration: 5000 })
               }
            }
         })
         .catch((error) => {
            const errors: Record<string, string> = {}
            error.inner.forEach((err: any) => {
               if (err.path === 'role.name' || err.path === 'role.value') {
                  errors['role'] = 'Wybierz rolę'
               }
               else {
                  errors[err.path] = err.message
               }
            })
            setValidationErrors(errors)
         })
   }

   return (
      <form className="app-page-form-wrapper" onSubmit={handleFormSubmit}>
         <h4 className='app-page-form-label'>Nowy użytkownik</h4>
            <div className='app-page-form-input-wrapper'>
               <label htmlFor='AddUserFullName'  className='required-label'>Imię i nazwisko</label>
               <InputText
                  name="AddUserFullName"
                  id="AddUserFullName"
                  className='app-page-form-input'
                  invalid={!!validationErrors.fullName}
                  value={currentFormValues.fullName}
                  placeholder="Podaj imię i nazwisko"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentFormValues({ ...currentFormValues, fullName: e.target.value })}
                  type="text"
               />
               <small className="p-error app-form-helper-text">
                  {validationErrors.fullName}
               </small>
            </div>
            <div className='app-page-form-input-wrapper'>
               <label htmlFor='AddUserPosition' className='required-label'>Stanowisko</label>
               <InputText
                  name="AddUserPosition"
                  id="AddUserPosition"
                  className='app-page-form-input'
                  invalid={!!validationErrors.position}
                  value={currentFormValues.position}
                  placeholder="Podaj stanowisko"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentFormValues({ ...currentFormValues, position: e.target.value })}
                  type="text"
               />
               <small className="p-error app-form-helper-text">
                  {validationErrors.position}
               </small>
            </div>
            <div className='app-page-form-input-wrapper'>
               <label htmlFor='AddUserEmail' className='required-label'>Email</label>
               <InputText
                  name="AddUserEmail"
                  id="AddUserEmail"
                  className='app-page-form-input'
                  invalid={!!validationErrors.email}
                  value={currentFormValues.email}
                  placeholder="Podaj adres email"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentFormValues({ ...currentFormValues, email: e.target.value })}
                  type="text"
                  keyfilter="email"
               />
               <small className="p-error app-form-helper-text">
                  {validationErrors.email}
               </small>
            </div>
            <div className='app-page-form-input-wrapper'>
               <label htmlFor='AddUserRole' className='required-label'>Rola</label>
               <Dropdown
                  id="AddUserRole"
                  optionValue="name"
                  value={currentFormValues.role.name}
                  onChange={(e) => {
                     const selectedRole = rolesDropdownOptions.find((role) => role.name === e.value);
                     if (selectedRole) {
                        setCurrentFormValues({ ...currentFormValues, role: selectedRole });
                     }
                  }}
                  invalid={!!validationErrors.role}
                  options={rolesDropdownOptions}
                  placeholder="Wybierz rolę"
                  optionLabel="name"
                  className='app-page-form-input'
               />
               <small className="p-error app-form-helper-text">
                  {validationErrors['role.name'] || validationErrors['role']}
               </small>
            </div>
            <div className="app-page-form-switch-wrapper add-user-page-switch-wrapper" style={{ margin: '25px 0 30px 0' }}>
               <label htmlFor="AddUserIsActive" className="add-user-form-label required-label">Czy aktywny?</label>
               <InputSwitch
                  id="AddUserIsActive"
                  checked={currentFormValues.active}
                  onChange={(e) => setCurrentFormValues({ ...currentFormValues, active: e.value })}
               />
            </div>

            <Button className="app-page-form-submit-button" variant="contained" type="submit">
               Dodaj użytkownika
            </Button>
         </form>
   )
}

export default UserForm
