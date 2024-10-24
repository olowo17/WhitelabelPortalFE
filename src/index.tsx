import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import DateAdapter from '@mui/lab/AdapterDateFns';
import { LocalizationProvider } from '@mui/lab';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { store } from './store/store';
import SnackbarProvider from './components/SnackbarProvider';
import ThemeConfig from './theme';
import 'pace-js/pace.min';
import 'pace-js/pace-theme-default.min.css';
import 'simplebar/src/simplebar.css';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <ThemeConfig>
          <HelmetProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </HelmetProvider>
          <SnackbarProvider />
        </ThemeConfig>
      </LocalizationProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
