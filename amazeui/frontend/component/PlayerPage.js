import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { AppBar, Button, ButtonGroup, Toolbar } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { grey } from '@material-ui/core/colors';
import { IconFlagUS, IconFlagFR } from 'material-ui-flags';
import { Brightness7, Brightness4 } from '@material-ui/icons';
import { NavLink, Switch } from 'react-router-dom';
import PrivateRoute from '../utils/PrivateRoute';

import playerService from '../utils/player_service';

const BotManager = React.lazy(() => import(/* webpackChunkName: "BotManager" */'./BotManager.js'));
const MazeManager = React.lazy(() => import(/* webpackChunkName: "MazeManager" */'./MazeManager.js'));
const GameManager = React.lazy(() => import(/* webpackChunkName: "GameManager" */'./GameManager.js'));

/**
 * Home Component
 * 
 * @param {Object} props 
 */
export default function Home(props) {
    const { keycloak, initialized } = useKeycloak()

    // for I18N
    const { t, i18n } = useTranslation();

    /**
     * Profile is something like
     * {
     *   "username": "joe",
     *   "firstName": "Joe",
     *   "lastName": "Dalton",
     *   "email": "joe.dalton@foo.org",
     *   "emailVerified": true,
     *   "attributes": {}
     *  }
     */
    const [profile, setProfile] = useState({});

    const [playerId, setPlayerId] = useState(0);

    const [uiTheme, setUITheme] = useState('dark');
    const [lang, setLang] = useState(i18n.language);

    useEffect(() => {
        if (initialized && keycloak.authenticated) {
            keycloak.loadUserProfile()
                .then((profile) => {
                    setProfile(profile);
                    console.log(JSON.stringify(profile, null, "  "))

                    playerService.get("api/players/my/info")
                        .then((response) => {
                            setPlayerId(response.data.id);
                        }).catch((error) => {
                            console.error('Failed to load user profile');
                        });

                }).catch(() => {
                    console.error('Failed to load user profile');
                });
            keycloak.loadUserInfo()
                .then((info) => {
                    console.log(JSON.stringify(info, null, "  "))
                }).catch(() => {
                    console.error('Failed to load user info');
                });

        }
    }, [initialized, keycloak.authenticated]);

    const toggleUITheme = () => {
        if (uiTheme === 'dark') {
            setUITheme('light');
        } else {
            setUITheme('dark');
        }
        props.toggleUITheme();
    };

    const changeLanguage = lng => {
        i18n.changeLanguage(lng);
        setLang(lng);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Button size="small" style={{ color: grey[400] }} onClick={() => toggleUITheme()} >
                        {uiTheme === 'dark' ? <Brightness4 /> : <Brightness7 />}
                    </Button>
                    <h2 style={{ marginRight: 20, marginLeft: 20, flexGrow: 1 }}>MazeBot {profile.username} ({playerId})</h2>
                    <ButtonGroup color="primary" aria-label="outlined primary button group">

                        <Button component={NavLink} to={"/players/" + playerId + "/bot" } activeClassName='activePage' variant="contained" >{t("bot")}</Button>
                        <Button component={NavLink} to={"/players/" + playerId + "/mazes" } activeClassName='activePage' variant="contained" >{t("maze")}</Button>
                        <Button component={NavLink} to={"/players/" + playerId + "/games" } activeClassName='activePage' variant="contained" >{t("game")}</Button>
                        <Button variant="contained" onClick={() => keycloak.logout()}>{t("Logout")}</Button>
                    </ButtonGroup>

                    <ButtonGroup style={{marginLeft:10}}>
                        <Button style={lang.startsWith('fr') ? { backgroundColor: grey[400] } : {}} onClick={() => changeLanguage('fr')}>
                            <IconFlagFR style={{ height: 12, width: 12 }} />
                        </Button>
                        <Button style={lang.startsWith('en') ? { backgroundColor: grey[400] } : {}} onClick={() => changeLanguage('en')}>
                            <IconFlagUS style={{ height: 12, width: 12 }} />
                        </Button>
                    </ButtonGroup>
                </Toolbar>
            </AppBar>

            <div style={{ display: 'flex', flexGrow: 1 }}>
                <Switch>
                    <PrivateRoute roles={['ui.player']} path="/players/:playerId/mazes" component={MazeManager} />
                    <PrivateRoute roles={['ui.player']} path="/players/:playerId/games" component={GameManager} />
                    <PrivateRoute roles={['ui.player']} path={'/players/:playerId/bot'} component={BotManager} />
                </Switch>
            </div>

        </div>
    );
}