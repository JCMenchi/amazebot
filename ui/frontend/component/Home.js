import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Button } from '@material-ui/core';

/**
 * Home Component
 * 
 * @param {Object} props 
 */
export default function Home(props) {
    const { keycloak, initialized } = useKeycloak()

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

    useEffect(() => {
        if (initialized) {
            keycloak.loadUserProfile()
            .then((profile) => {
                setProfile(profile);
                console.log(JSON.stringify(profile, null, "  "))
            }).catch(() => {
                console.error('Failed to load user profile');
            });
        }
    }, [initialized]);

    return (
        <div>
            
            {!keycloak.authenticated && (
                <div>
                    <h2><span style={{margin:10}}>Please</span>
                    <Button size="small" style={{fontWeight:"bold"}}  variant="outlined" onClick={() => {
                            keycloak.login();
                        }
                    }>
                        Sign-in
                    </Button>
                    <span style={{margin:10}}>or</span>
                    <Button size="small" style={{fontWeight:"bold"}}  variant="outlined" onClick={() => {
                            keycloak.register();
                        }
                    }>
                        Register
                    </Button>
                    </h2>
                </div>
            )}

            {!!keycloak.authenticated && (
                <div>
                    <h2 style={{margin:10}}>Welcome { profile.username }</h2>
                    <Button size="small" style={{marginLeft:10, fontWeight:"bold"}}  variant="outlined" onClick={() => keycloak.logout()}>
                        Logout
                    </Button>
                    
                </div>
            )}
        </div>
    );
}