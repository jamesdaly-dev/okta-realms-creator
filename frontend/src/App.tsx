import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Security, LoginCallback } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { oktaConfig } from './config/oktaConfig';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { LoginCallback as LoginCallbackPage } from './pages/LoginCallback';
import { SecureRoute } from './components/SecureRoute';

const oktaAuth = new OktaAuth(oktaConfig);

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const restoreOriginalUri = async (_oktaAuth: OktaAuth, originalUri: string) => {
    window.location.replace(toRelativeUrl(originalUri || '/dashboard', window.location.origin));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login/callback" element={<LoginCallbackPage />} />
            <Route
              path="/dashboard"
              element={
                <SecureRoute>
                  <Dashboard />
                </SecureRoute>
              }
            />
          </Routes>
        </Security>
      </Router>
    </ThemeProvider>
  );
}

export default App;
