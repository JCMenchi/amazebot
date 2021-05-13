import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route, Switch, useHistory } from 'react-router-dom';
import { Fab, Paper, List, ListItem, ListItemText } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import PlayerAddDialog from './PlayerAdd';
import PlayerDetails from './PlayerDetails';
import playerService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Player Manager Component
 * 
 */
export default function PlayerManager(props) {

    const history = useHistory();

    // for I18N
    const { t } = useTranslation();

    // Store the players in a state variable.
    // We are passing an empty array as the default value.
    const [players, setPlayers] = useState([]);

    // message to display when nothing is selected or after an error
    const [errorMessage, setErrorMessage] = useState(t('Please select a player.'));

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
        loadPlayer(-1);
    }, []);

    
    const loadPlayer = (id) => {
        playerService
        .get("api/players")
        .then((response) => {
            setPlayers(response.data);
            if (id !== -1) { 
                if (id) {
                    history.push(`/players/${id}`);
                } else {
                    history.push('/players');
                }
            }
        })
        .catch((error) => {
            if (error.response.data) {
                // data is an object like { error: 101, message: 'error message'}
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage(error.response.statusText);
            }
        });
    }

    // Add player dialog management
    const handleAddPlayer = (event) => {
        // show dialog
        setOpenAddDialog(true);
    }

    const handleCloseAddDialog = (value) => {
        LOGGER.info(`Add player: ${JSON.stringify(value)}`);
        setOpenAddDialog(false);
        if (value.error) {
            setErrorMessage(value.message);
        } else if (value.id) {
            loadPlayer(value.id);
        }
    };

    return (
        <Paper elevation={4} variant='elevation' style={{ padding: 4, height: '100%', width: '100%', overflow: 'hidden' }}>
            
            {  <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                    <nav>
                        <List>
                            {players.map(item => (
                                <ListItem key={item.id} button component={Link} to={`${props.match.url}/${item.id}`} 
                                          selected={selectedIndex === item.id} 
                                          onClick={(event) => handleListItemClick(event, item.id)}>
                                    <ListItemText primary={item.name} />
                                </ListItem>
                            ))}
                        </List>
                        <Fab size="small" color="primary" aria-label="add"
                             onClick={(event) => handleAddPlayer(event)}>
                            <AddIcon />
                        </Fab>
                        <PlayerAddDialog open={openAddDialog} onClose={handleCloseAddDialog} />
                    </nav>
                    <main style={{ marginLeft: 4, flexGrow: 1 }}>
                        <Switch>
                            <Route path={`${props.match.url}/:playerId`} 
                                   render={(props) => (<PlayerDetails {...props} reload={loadPlayer} />)}/>
                            <Route exact path={props.match.url} render={() => <h3>{errorMessage}</h3>} />
                        </Switch>
                    </main>
                </div>
            }
        </Paper>
    );
}
