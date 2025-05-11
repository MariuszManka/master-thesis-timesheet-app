import React from "react";

import AppRoot from 'pages/AppRoot/AppRoot'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import { saveCurrentState, store } from 'store'
import { PrimeReactProvider } from 'primereact/api';
import { SnackbarProvider } from 'notistack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { plPL } from '@mui/x-date-pickers/locales';
import { plPL as corePlPL} from '@mui/material/locale'


const App = () => {
  store.subscribe(()=>{
    saveCurrentState(store.getState())
  })

  const theme = createTheme({
      palette: {
        primary: { main: '#010440' },
      },
      typography: {
        fontFamily: ['-apple-system', 'Poppins', 'sans-serif', ].join(',')
      }
    },
    plPL, // x-date-pickers translations // x-data-grid translations
    corePlPL, // core translations
  );

  return (
    <PrimeReactProvider>
      <Provider store={store}>
        <SnackbarProvider>
        <ThemeProvider theme={theme}>
            <Router>
              <div className='main-app-container'>
                <AppRoot />
              </div>
            </Router>
        </ThemeProvider>
        </SnackbarProvider>
      </Provider>
    </PrimeReactProvider>
  )
}

export default App