import './App.css'
import AppLayout from './layout/app-layout'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { AppPage } from './pages/AppPage'
import { LoginPage } from './pages/LoginPage'
import { ThemeProvider } from './components/theme-provider'
import { HistoryDetailPage } from './pages/HistoryDetailPage'
import { CollectionsPage } from './pages/CollectionsPage'
import { SettingsPage } from './pages/SettingsPage'

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
       },
       {
        path: '/app/collections',
        element: <CollectionsPage />
       },
       {
        path: '/app/settings',
        element: <SettingsPage />
       }
      ]
    },
    {
      path: '/history/:id',
      element: <AppLayout />,
      children: [
        {
          path: '/history/:id',
          element: <HistoryDetailPage />
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