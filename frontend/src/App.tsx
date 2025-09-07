import './App.css'
import AppLayout from './layout/app-layout'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <AppLayout />,
      children: [
       {
        path: '/',
        element: <LandingPage />
       }
      ]
    }
  ])
  return (
      <RouterProvider router={router} />
  )
}

export default App
;