import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route, Switch, useHistory } from 'react-router-dom';
import { Fab, Paper, List, ListItem, ListItemText } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import GameAddDialog from './GameAdd';
import GameDetails from './GameDetails';
import gameService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Game Manager Component
 * 
 */
export default function GameManager(props) {
    const history = useHistory();

    // for I18N
    const { t } = useTranslation();

    // Store the players in a state variable.
    // We are passing an empty array as the default value.
    const [games, setGames] = useState([]);

    // message to display when nothing is selected or after an error
    const [errorMessage, setErrorMessage] = useState(t('Please select a game.'));

    // is Add Player dialog open
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
   
    // current player
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
    };

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        loadGame(-1);
    }, []);

    const loadGame = (id) => {
        gameService
        .get("/api/games")
        .then((response) => {
            setGames(response.data);
            // if id is -1, it is the useEffect loading do not modify history
            if (id !== -1) { 
                if (id) {
                    history.push(`/games/${id}`);
                } else {
                    history.push('/games');
                }
            }
        })
        .catch((error) => {
            if (error.response && error.response.data) {
                // data is an object like { error: 101, message: 'error message'}
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage(error.message);
            }
        });
    }

    // Add Game dialog management
    const handleAddGame = (event) => {
        // show dialog
        setOpenAddDialog(true);
    }

    const handleCloseAddDialog = (value) => {
        LOGGER.info(`Add game: ${JSON.stringify(value)}`);
        setOpenAddDialog(false);
        if (value.error) {
            setErrorMessage(value.message);
        } else if (value.id) {
            loadGame(value.id);
        }
    };

    return (
        <Paper elevation={4} variant='elevation' style={{ padding: 4, height: '100%', width: '100%', overflow: 'hidden' }}>

            {  <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                    <nav>
                        <List>
                            {games.map(item => (
                                <ListItem key={item.id} button component={Link} to={`${props.match.url}/${item.id}`} 
                                          selected={selectedIndex === item.id} 
                                          onClick={(event) => handleListItemClick(event, item.id)}>
                                    <ListItemText primary={item.id} />
                                </ListItem>
                            ))}
                        </List>
                        <Fab size="small" color="primary" aria-label="add"
                             onClick={(event) => handleAddGame(event)}>
                            <AddIcon />
                        </Fab>
                        <GameAddDialog open={openAddDialog} onClose={handleCloseAddDialog} />
                    </nav>
                    <main style={{ marginLeft: 4, flexGrow: 1 }}>
                        <Switch>
                            <Route path={`${props.match.url}/:gameId`}
                                   render={(props) => (<GameDetails {...props} reload={loadGame} />)}/>
                            <Route exact path={props.match.url} render={() => <h3>{errorMessage}</h3>} />
                        </Switch>
                    </main>
                </div>
            }
        </Paper>
    );
}