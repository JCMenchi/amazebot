import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Link, Route, Switch, useHistory } from 'react-router-dom';
import { Fab, Grid, List, ListItem, ListItemText, Paper } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';

import BotAddDialog from './BotAdd';
import BotDetails from './BotDetails';
import playerService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Player Detail Component
 * 
 */
export default function PlayerDetails(props) {

    const history = useHistory();
    
    // for I18N
    const { t } = useTranslation();

    const par = useParams();
    const { playerId } = useParams();

    const [errorMessage, setErrorMessage] = useState('');

    const [player, setPlayer] = useState({});

    // is Add Bot dialog open
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
   
    // current bot
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
    };

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        setErrorMessage('');
        playerService
            .get("api/players/" + playerId)
            .then((response) => {
                setPlayer(response.data);
            })
            .catch((error) => {
                if (error.response) {
                    setErrorMessage(error.response.statusText);
                } else {
                    setErrorMessage(error.message);
                }
            });

    }, [playerId]);

    const loadPlayer = () => {
        setErrorMessage('');
        playerService
            .get("api/players/" + playerId)
            .then((response) => {
                setPlayer(response.data);
                history.push('/players/' + playerId);
            })
            .catch((error) => {
                if (error.response) {
                    setErrorMessage(error.response.statusText);
                } else {
                    setErrorMessage(error.message);
                }
            });
    }

    const handleDelete = (event, player_id) => {
        LOGGER.info(`Delete player ${player_id}`);
        playerService
            .delete("api/players/" + player_id)
            .then((response) => {
                LOGGER.info(`Player ${player_id} deleted.`);
                props.reload();
            })
            .catch((error) => {
                if (error.response.data) {
                    // data is an object like { error: 101, message: 'error message'}
                    LOGGER.error(`Error while deleting player ${player_id}: ${error.response.data.message}`);
                } else {
                    LOGGER.error(`Error while deleting player ${player_id}: ${error.response.statusText}`);
                }
            });
    }

    // Add bot dialog management
    const handleAddBot = (event) => {
        // show dialog
        setOpenAddDialog(true);
    }

    const handleCloseAddDialog = (value) => {
        LOGGER.info(`Add bot: ${JSON.stringify(value)}`);
        setOpenAddDialog(false);
        if (value.error) {
            setErrorMessage(value.message);
        } else if (value.id) {
            loadPlayer(value.id);
        }
    };

    return (
        <Paper elevation={4} variant='outlined' style={{ padding: 4, paddingBottom: 50, position: 'relative' }}>
            { errorMessage !== '' && <h3>{errorMessage}</h3>}

            { errorMessage === ''
                && <Grid container spacing={1} direction='column' alignItems='flex-start'>
                    <Grid item>
                        Id: {player.id}
                    </Grid>
                    <Grid item>
                        {t('Name')}: {player.name}
                    </Grid>
                    <Grid item style={{ width: '100%'}}>
                        <Grid container spacing={1}  direction='row' alignItems='flex-start'>
                            <Grid item >
                                {t('Bots')}:
                                <List>
                                    {player.bots && player.bots.map(item => (
                                        <ListItem key={item.id} button component={Link} to={`${props.match.url}/bot/${item.id}`}
                                            selected={selectedIndex === item.id}
                                            onClick={(event) => handleListItemClick(event, item.id)}>
                                            <ListItemText primary={item.name} />
                                        </ListItem>
                                    ))}
                                    <Fab size="small" style={{ width: 36, height: 36 }} color="primary" aria-label="add-bot"
                                        onClick={(event) => handleAddBot(event)}>
                                        <AddIcon fontSize='small'/>
                                    </Fab>
                                    <BotAddDialog open={openAddDialog} playerid={playerId} onClose={handleCloseAddDialog} />
                                </List>
                            </Grid>
                            <Grid item style={{ flexGrow: 1 }}>
                                <Switch>
                                    <Route path={`${props.match.url}/bot/:botId`}
                                        render={(props) => (<BotDetails {...props} playerid={playerId} reload={loadPlayer} />)} />
                                </Switch>
                            </Grid>
                        </Grid>
                    </Grid>

                </Grid>
            }
            <Fab size="small" style={{ position: 'absolute' }} color="primary" className="fabright" aria-label="delete"
                onClick={(event) => handleDelete(event, player.id)}>
                <DeleteIcon/>
            </Fab>
        </Paper>
    );
}
