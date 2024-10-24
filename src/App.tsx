import React from 'react';
import ScrollToTop from './components/ScrollToTop';
import Routes from './routes/routes';
import './assets/i18n/config';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes />
    </>
  );
}

export default App;
