import './App.css'
import AppLayout from './layout/app-layout'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { AppPage } from './pages/AppPage'
import { LoginPage } from './pages/LoginPage'
import { ThemeProvider } from './components/theme-provider'

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <HomePage />
    },
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/app',
      element: <AppLayout />,
      children: [
       {
        path: '/app',
        element: <AppPage />
       }
      ]
    }
  ])
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="postman-lite-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App