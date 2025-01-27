import React from 'react';
import { useOutlet } from 'react-router-dom'
import Navbar from 'components/Navbar/Navbar'


import './PageLayout.scss'

const PageLayout = () => {
   const outlet = useOutlet()

   return (
      <div className='page-wrapper'>
         <Navbar/>
         <main className='page-layout-outer-wrapper'>
            <div className='page-content-wrapper'>
              { outlet  }
            </div>
         </main>
      </div>
   )
}

export default PageLayout