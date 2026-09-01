import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { Auth0Provider } from '@auth0/auth0-react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain='dev-708h3lppnv1qmred.us.auth0.com'
      clientId='hptSMbniTEdkRrHlpgTnOzztJRv9EdC3'
      authorizationParams={{ redirect_uri: window.location.origin }}
      cacheLocation='localstorage'
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
);
