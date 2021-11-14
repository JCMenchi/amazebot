import React, { useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';

import PrivateRoute from './utils/PrivateRoute';

import axiosInstance from './utils/player_service';

const PlayerPage = React.lazy(() => import(/* webpackChunkName: "Home" */'./component/PlayerPage.js'));
const LoginPage = React.lazy(() => import(/* webpackChunkName: "LoginPage" */'./component/LoginPage.js'));

import './App.css';
import keycloak from './keycloak';

/* Style info to use for theming */
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  }
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  }
});

const eventLogger = (event, error) => {
  console.log('onKeycloakEvent', event, error);
}

/**
 * Use this callback to inject bearer token in axios instance
 * @param {*} tokens 
 */
const tokenLogger = (tokens) => {
  console.log('onKeycloakTokens', tokens);

  if (tokens && tokens.token) {
    const bearer = `Bearer ${tokens.token}`;
    axiosInstance.defaults.headers.Authorization = bearer;
  } else {
    if (axiosInstance.defaults.headers.Authorization) {
      delete axiosInstance.defaults.headers.Authorization;
    }
  }
}

/**
 * Main Application Component
 * 
 * @param {Object} props 
 */
export default function App(props) {

  // local state
  const [errorMessage, setErrorMessage] = useState('');
  const [uiTheme, setUITheme] = useState('dark');
  
  const toggleUITheme = () => {
    if (uiTheme === 'dark') {
      setUITheme('light');
    } else {
      setUITheme('dark');
    }
  };

  return (

    <ThemeProvider theme={uiTheme === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      <ReactKeycloakProvider authClient={keycloak} onEvent={eventLogger} onTokens={tokenLogger}>
        {/* Snackbar used to display error message */}
        <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={errorMessage !== ''} autoHideDuration={6000}
          onClose={() => setErrorMessage('')}>
          <Alert variant='filled' onClose={() => setErrorMessage('')} severity='error'>
            <p>{errorMessage}</p>
          </Alert>
        </Snackbar>

        <BrowserRouter basename="/amazeui/">
            <Switch>
              <Route exact path="/login" render={(props) => (<LoginPage {...props} toggleUITheme={toggleUITheme} />)} />
              <PrivateRoute roles={['ui.player', 'ui.admin']} path="/" component={PlayerPage} toggleUITheme={toggleUITheme} />
          
            </Switch>
        </BrowserRouter>
      </ReactKeycloakProvider>
    </ThemeProvider>

  );
}
