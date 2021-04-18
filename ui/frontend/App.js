import React, { useState } from 'react';
import { BrowserRouter, NavLink, Route, Switch } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { AppBar, Button, ButtonGroup, CssBaseline, Snackbar, ThemeProvider, createMuiTheme } from '@material-ui/core';
import { Brightness7, Brightness4 } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import { grey } from '@material-ui/core/colors';
import { IconFlagUS, IconFlagFR } from 'material-ui-flags';

const Home = React.lazy(() => import(/* webpackChunkName: "Home" */'./component/Home.js'));
const PlayerManager = React.lazy(() => import(/* webpackChunkName: "PlayerManager" */'./component/PlayerManager.js'));
const MazeManager = React.lazy(() => import(/* webpackChunkName: "MazeManager" */'./component/MazeManager.js'));
const GameManager = React.lazy(() => import(/* webpackChunkName: "GameManager" */'./component/GameManager.js'));

import './App.css';

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

/**
 * Main Application Component
 * 
 * @param {Object} props 
 */
export default function App(props) {

  // for I18N
  const { t, i18n } = useTranslation();

  // local state
  const [errorMessage, setErrorMessage ] = useState('');
  const [uiTheme, setUITheme ] = useState('dark');
  const [lang, setLang ] = useState(i18n.language);

  const toggleUITheme = () => {
    if (uiTheme==='dark') {
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
    <ThemeProvider theme={uiTheme==='dark'?darkTheme:lightTheme}>
      <CssBaseline />
      
      {/* Snackbar used to display error message */}
      <Snackbar anchorOrigin={{vertical: 'top', horizontal: 'center'}} 
                open={errorMessage !== ''} autoHideDuration={6000} 
                onClose={() => setErrorMessage('')}>
          <Alert variant='filled' onClose={() => setErrorMessage('')} severity='error'>
            <p>{errorMessage}</p>
          </Alert>
      </Snackbar>
      
      <BrowserRouter>
        <AppBar position="static">
          <ButtonGroup color="primary" aria-label="outlined primary button group">
            <Button size="small" style={{color: grey[400]}} onClick={() => toggleUITheme() } >
              {uiTheme==='dark'?<Brightness4/>:<Brightness7/> }
            </Button>
            <Button component={ NavLink } exact to="/" activeClassName='activePage' variant="contained" >{t("home")}</Button>
            <Button component={ NavLink } to="/players" activeClassName='activePage' variant="contained" >{t("player")}</Button>
            <Button component={ NavLink } to="/mazes" activeClassName='activePage' variant="contained" >{t("maze")}</Button>
            <Button component={ NavLink } to="/games" activeClassName='activePage' variant="contained" >{t("game")}</Button>
          <Button style={lang.startsWith('fr')?{backgroundColor: grey[400]}:{}} onClick={() => changeLanguage('fr')}>
            <IconFlagFR style={{height:12, width:12}}/>
          </Button>
        
          <Button style={lang.startsWith('en')?{backgroundColor: grey[400]}:{}} onClick={() => changeLanguage('en')}>
            <IconFlagUS style={{height:12, width:12}}/>
          </Button>
        </ButtonGroup>
        </AppBar>
        <div style={{display:'flex', flexGrow: 1}}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/players" component={PlayerManager} />
            <Route path="/mazes" component={MazeManager} />
            <Route path="/games" component={GameManager} />
          </Switch>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
