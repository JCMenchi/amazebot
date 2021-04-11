import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route, Switch } from 'react-router-dom';
import { Paper, List, ListItem, ListItemText } from '@material-ui/core';

import GameDetails from './GameDetails';
import gameService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Game Manager Component
 * 
 * @param {Object} props 
 */
export default function GameManager(props) {

    // for I18N
    const { t } = useTranslation();

    // Store the players in a state variable.
    // We are passing an empty array as the default value.
    const [games, setGames] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');

    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
    };

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        gameService
            .get("/api/games")
            .then((response) => {
                setGames(response.data);
            })
            .catch((error) => {
                setErrorMessage(error.response.data);
            });
    }, []);

    return (
        <Paper elevation={4} variant='elevation' style={{ padding: 4, height: '100%', width: '100%', overflow: 'hidden' }}>
            { errorMessage !== '' && <h3>{errorMessage}</h3>}

            { errorMessage === ''
                && <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                    <nav>
                        <List>
                            {games.map(item => (
                                <ListItem key={item.id} button component={Link} to={`${props.match.url}/${item.id}`} selected={selectedIndex === item.id} onClick={(event) => handleListItemClick(event, item.id)}>
                                    <ListItemText primary={item.id} />
                                </ListItem>
                            ))}
                        </List>
                    </nav>
                    <main style={{ marginLeft: 4, flexGrow: 1 }}>
                        <Switch>
                            <Route path={`${props.match.url}/:gameId`} component={GameDetails} />
                            <Route exact path={props.match.url} render={() => <h3>Please select a player.</h3>} />
                        </Switch>
                    </main>
                </div>
            }
        </Paper>
    );
}