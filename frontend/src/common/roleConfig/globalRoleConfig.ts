export enum SystemRoles {
   DEFAULT =  '',
   ADMIN = 'admin',
   MANAGER = 'manager',
   EMPLOYEE = 'employee',
}

export const mapRoleToName = (role: SystemRoles) => {
   switch(role) {
      case SystemRoles.ADMIN:
         return "Administrator"
      case SystemRoles.MANAGER:
         return "Menedżer"
      case SystemRoles.EMPLOYEE:
         return "Pracownik"

      default: return ""   
   }
}

export const rolesDropdownOptions = [
   { name: mapRoleToName(SystemRoles.ADMIN), value: SystemRoles.ADMIN },
   { name: mapRoleToName(SystemRoles.MANAGER), value: SystemRoles.MANAGER },
   { name: mapRoleToName(SystemRoles.EMPLOYEE), value: SystemRoles.EMPLOYEE },
]

export enum profileFieldsNames {
   EMAIL = 'profileEmailField',
   FULL_NAME = 'profileFullNameField',
   ROLE = 'profileRoleField',
   POSITION = 'profilePositionField',
   PHONE = 'profilePhoneField',
   ACTIVE = 'profileActiveField',
}

export const profileFieldsEditPrivilegesByRole = {
   [SystemRoles.ADMIN]: [profileFieldsNames.EMAIL, profileFieldsNames.FULL_NAME, profileFieldsNames.PHONE, profileFieldsNames.POSITION, profileFieldsNames.ACTIVE],
   [SystemRoles.MANAGER]: [profileFieldsNames.EMAIL, profileFieldsNames.FULL_NAME, profileFieldsNames.PHONE],
   [SystemRoles.EMPLOYEE]: [profileFieldsNames.EMAIL, profileFieldsNames.FULL_NAME, profileFieldsNames.PHONE]
}  