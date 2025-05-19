import { Route, Routes } from 'react-router-dom'
import { Home } from 'pages'
import { ROUTES } from './routes.utils'

export const AppRouter = () => {

  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Home />} />
    </Routes>
  )
  }