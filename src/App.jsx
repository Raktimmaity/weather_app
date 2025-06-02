import { useState } from 'react'
import Weather from './components/Weather'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import DownloadPage from './components/DownloadPage'

function App() {
  const route = createBrowserRouter([
    {
      path: '/',
      element: (
        <Weather/>
      )
    },
    {
      path: '/download',
      element: (
       <DownloadPage/>
      )
    }
  ])

  return (
    <div className='app'>
      <RouterProvider router={route}/>
    </div>
  )
}

export default App
