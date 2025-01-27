import { AppLinks } from 'common/AppLinks'
import { SessionStorage } from 'common/CookieStorage'
import { STORAGEKEYS } from 'environment/Keys'
import { Navigate } from "react-router-dom"

export const ProtectedRoute = ({ children }: { children: any }) => {
  const sessionStorage = new SessionStorage()
  const access_token = sessionStorage.get(STORAGEKEYS.ACCESS_TOKEN)

  if (access_token === null) {
    // user is not authenticated
    return <Navigate to={AppLinks.login} />
  }

  return children
}