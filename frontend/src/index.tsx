import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './index.scss'
import 'primereact/resources/themes/mdc-light-deeppurple/theme.css';


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)


root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)