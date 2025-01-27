import React from "react";

import AppRoot from 'pages/AppRoot/AppRoot'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import { saveCurrentState, store } from 'store'
import { PrimeReactProvider } from 'primereact/api';
import { SnackbarProvider } from 'notistack';




const App = () => {
  store.subscribe(()=>{
    saveCurrentState(store.getState())
  })

  return (
    <PrimeReactProvider>
      <Provider store={store}>
        <SnackbarProvider>
            <Router>
              <div className='main-app-container'>
                <AppRoot />
              </div>
            </Router>
        </SnackbarProvider>
      </Provider>
    </PrimeReactProvider>
  )
}

export default App