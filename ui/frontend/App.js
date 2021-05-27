import React, { useState } from 'react';
import { BrowserRouter, NavLink, Route, Switch } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { useTranslation } from 'react-i18next';

import { AppBar, Button, ButtonGroup, CssBaseline, Snackbar, ThemeProvider, createMuiTheme } from '@material-ui/core';
import { Brightness7, Brightness4 } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import { grey } from '@material-ui/core/colors';
import { IconFlagUS, IconFlagFR } from 'material-ui-flags';

import PrivateRoute from './utils/PrivateRoute';

import axiosInstance from './utils/player_service';

const Home = React.lazy(() => import(/* webpackChunkName: "Home" */'./component/Home.js'));
const PlayerManager = React.lazy(() => import(/* webpackChunkName: "PlayerManager" */'./component/PlayerManager.js'));
const MazeManager = React.lazy(() => import(/* webpackChunkName: "MazeManager" */'./component/MazeManager.js'));
const GameManager = React.lazy(() => import(/* webpackChunkName: "GameManager" */'./component/GameManager.js'));

import './App.css';
import keycloak from './keycloak';

/* Style info to use for theming */
const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  }
});

const lightTheme = createMuiTheme({
  palette: {
    type: 'light',
  }
});

const eventLogger = (event) => {
  console.log('onKeycloakEvent', event);
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

  // for I18N
  const { t, i18n } = useTranslation();

  // local state
  const [errorMessage, setErrorMessage] = useState('');
  const [uiTheme, setUITheme] = useState('dark');
  const [lang, setLang] = useState(i18n.language);

  const toggleUITheme = () => {
    if (uiTheme === 'dark') {
      setUITheme('light');
    } else {
      setUITheme('dark');
    }
  };

  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
    setLang(lng);
  };

  return (

    <ThemeProvider theme={uiTheme === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      <ReactKeycloakProvider authClient={keycloak}  onEvent={eventLogger} onTokens={tokenLogger}>
        {/* Snackbar used to display error message */}
        <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={errorMessage !== ''} autoHideDuration={6000}
          onClose={() => setErrorMessage('')}>
          <Alert variant='filled' onClose={() => setErrorMessage('')} severity='error'>
            <p>{errorMessage}</p>
          </Alert>
        </Snackbar>

        <BrowserRouter basename="/adminui/">
          <AppBar position="static">
            <ButtonGroup color="primary" aria-label="outlined primary button group">
              <Button size="small" style={{ color: grey[400] }} onClick={() => toggleUITheme()} >
                {uiTheme === 'dark' ? <Brightness4 /> : <Brightness7 />}
              </Button>
              <Button component={NavLink} exact to="/" activeClassName='activePage' variant="contained" >{t("home")}</Button>
              <Button component={NavLink} to="/players" activeClassName='activePage' variant="contained" >{t("player")}</Button>
              <Button component={NavLink} to="/mazes" activeClassName='activePage' variant="contained" >{t("maze")}</Button>
              <Button component={NavLink} to="/games" activeClassName='activePage' variant="contained" >{t("game")}</Button>
              <Button style={lang.startsWith('fr') ? { backgroundColor: grey[400] } : {}} onClick={() => changeLanguage('fr')}>
                <IconFlagFR style={{ height: 12, width: 12 }} />
              </Button>

              <Button style={lang.startsWith('en') ? { backgroundColor: grey[400] } : {}} onClick={() => changeLanguage('en')}>
                <IconFlagUS style={{ height: 12, width: 12 }} />
              </Button>
            </ButtonGroup>
          </AppBar>
          <div style={{ display: 'flex', flexGrow: 1 }}>
            <Switch>
              <Route exact path="/" component={Home} />
              
              <PrivateRoute roles={['ui.admin']} path="/mazes" component={MazeManager} />
              <PrivateRoute roles={['ui.player', 'ui.admin']} path="/games" component={GameManager} />
              <PrivateRoute roles={['ui.player', 'ui.admin']} path="/players" component={PlayerManager} />
              
            </Switch>
          </div>
        </BrowserRouter>
      </ReactKeycloakProvider>
    </ThemeProvider>

  );
}
