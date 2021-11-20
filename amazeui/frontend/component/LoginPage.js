import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { AppBar, Button, ButtonGroup, Toolbar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';
import ReactCountryFlag from "react-country-flag";
import { Brightness7, Brightness4 } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import playerService from '../utils/player_service';

/**
 * Home Component
 * 
 * @param {Object} props 
 */
export default function LoginPage(props) {
    const { keycloak, initialized } = useKeycloak()

    const navigate = useNavigate();

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
                    console.log("Roles: " + JSON.stringify(keycloak.realmAccess.roles));
                    console.log("Roles: " + JSON.stringify(keycloak.resourceAccess));
                    playerService.get("api/players/my/info")
                        .then((response) => {
                            setPlayerId(response.data.id);
                        }).catch((error) => {
                            console.error('Failed to load user profile');
                        });

                }).catch(() => {
                    console.error('Failed to load user profile');
                });

                if (keycloak.hasRealmRole('ui.player')) {
                    navigate('/');
                } else if (keycloak.hasRealmRole('ui.admin')) {
                    navigate('/admin');
                }

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
                    <h2 style={{ marginRight: 20, marginLeft: 20, flexGrow: 1 }}>MazeBot</h2>
                    <ButtonGroup color="primary" aria-label="outlined primary button group">
                        <Button style={lang.startsWith('fr') ? { backgroundColor: grey[400] } : {}} onClick={() => changeLanguage('fr')}>
                            <ReactCountryFlag countryCode="FR" />
                        </Button>

                        <Button style={lang.startsWith('en') ? { backgroundColor: grey[400] } : {}} onClick={() => changeLanguage('en')}>
                            <ReactCountryFlag countryCode="US" />
                        </Button>
                    </ButtonGroup>
                </Toolbar>
            </AppBar>

            {!keycloak.authenticated && (
                <div>
                    <h2><span style={{ margin: 10 }}>{t("Please")}</span>
                        <Button size="small" style={{ fontWeight: "bold" }} variant="outlined" onClick={() => {
                            keycloak.login();
                        }
                        }>
                            {t("Sign-in")}
                        </Button>
                        <span style={{ margin: 10 }}>{t("or")}</span>
                        <Button size="small" style={{ fontWeight: "bold" }} variant="outlined" onClick={() => {
                            keycloak.register();
                        }
                        }>
                            {t("Register")}
                        </Button>
                    </h2>
                </div>
            )}

            {!!keycloak.authenticated && (
                <div>
                    <h2 style={{ margin: 10 }}>Welcome {profile.username} ({playerId})</h2>
                    <Button size="small" style={{ marginLeft: 10, fontWeight: "bold" }} variant="outlined" onClick={() => keycloak.logout()}>
                        Logout
                    </Button>
                </div>
            )}
        </div>
    );
}