import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route, Switch, useHistory } from 'react-router-dom';
import { Fab, Paper, Grid, List, ListItem, ListItemText } from '@material-ui/core';
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

            <Grid container spacing={2}>

                {games.map(item => (
                    <Grid item key={item.id}>
                        <GameDetails gameId={item.id} />
                    </Grid>
                ))}

                <Fab size="small" color="primary" aria-label="add"
                        onClick={(event) => handleAddGame(event)}>
                    <AddIcon />
                </Fab>
                <GameAddDialog open={openAddDialog} onClose={handleCloseAddDialog} />

            </Grid>
        </Paper>
    );
}