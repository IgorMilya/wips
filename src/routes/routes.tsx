import { Navigate, Route, Routes } from 'react-router-dom'
import { Blacklist, Dashboard, HomeLayout, Scanner } from 'pages'
import { ROUTES } from './routes.utils'

export const AppRouter = () => {

  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} />} />
      <Route path={ROUTES.HOME} element={<HomeLayout />}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.SCANNER} element={<Scanner />} />
        <Route path={ROUTES.BLACKLIST} element={<Blacklist />} />
      </Route>
    </Routes>
  )
}