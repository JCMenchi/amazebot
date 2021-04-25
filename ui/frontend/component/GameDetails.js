import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AppBar, Fab, Grid, IconButton, Paper, Toolbar, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ReplayIcon from '@material-ui/icons/Replay';

import gameService from '../utils/player_service';
import LOGGER from '../utils/uilogger';
import { LocationDisabledTwoTone } from '@material-ui/icons';

/**
 * Game Detail Component
 * 
 */
export default function GameDetails(props) {

    // for I18N
    const { t } = useTranslation();

    const { gameId } = useParams();

    const [errorMessage, setErrorMessage] = useState('');

    const [game, setGame] = useState({});

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        loadData();
    }, [gameId]);

    const loadData = () => {
        setErrorMessage('');
        gameService
            .get("/api/games/" + gameId)
            .then((response) => {
                setGame(response.data);
            })
            .catch((error) => {
                if (error.response) {
                    setErrorMessage(error.response.statusText);
                } else {
                    setErrorMessage(error.message);
                }
            });
    }

    const handleEdit = (event, game_id) => {
        LOGGER.info(`Edit game ${game_id}`);
        loadData();
    }

    const handleReload = (event, game_id) => {
        LOGGER.info(`Reload game ${game_id}`);
        loadData();
    }

    const handleRun = (event, game_id) => {
        LOGGER.info(`Run game ${game_id}`);
        gameService
            .post("api/games/" + game_id + "/start")
            .then((response) => {
                LOGGER.info(`Game ${game_id} started.`);
                loadData();
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.data) {
                        // data is an object like { error: 101, message: 'error message'}
                        LOGGER.error(`Error while starting game ${game_id}: ${error.response.data.message}`);
                    } else {
                        LOGGER.error(`Error while starting game ${game_id}: ${error.response.statusText}`);
                    }
                } else {
                    LOGGER.error(`Error while starting game ${game_id}: ${error.message}`);
                }
            });
    }

    const handleDelete = (event, game_id) => {
        LOGGER.info(`Delete game ${game_id}`);
        gameService
            .delete("api/games/" + game_id)
            .then((response) => {
                LOGGER.info(`Game ${game_id} deleted.`);
                props.reload();
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.data) {
                        // data is an object like { error: 101, message: 'error message'}
                        LOGGER.error(`Error while deleting game ${game_id}: ${error.response.data.message}`);
                    } else {
                        LOGGER.error(`Error while deleting game ${game_id}: ${error.response.statusText}`);
                    }
                } else {
                    LOGGER.error(`Error while deleting game ${game_id}: ${error.message}`);
                }
            });
    }

    return (
        <Paper elevation={4} variant='outlined' style={{ padding: 4, position: 'relative' }}>
            <AppBar variant="outlined" size="small" position='relative'>
                <Toolbar size="small" variant="dense">
                    <span style={{ flexGrow: 1}}>
                        {t('Game Id')}: {game.id}
                    </span>
                    <IconButton size="small" color="inherit" onClick={(event) => handleRun(event, game.id)}>
                        <PlayArrowIcon size="small"/>
                    </IconButton>
                    <IconButton size="small" color="inherit" onClick={(event) => handleReload(event, game.id)}>
                        <ReplayIcon size="small"/>
                    </IconButton>
                    <IconButton size="small" color="inherit" onClick={(event) => handleEdit(event, game.id)}>
                        <EditIcon size="small"/>
                    </IconButton>
                    <IconButton size="small" edge="end" color="inherit" onClick={(event) => handleDelete(event, game.id)}>
                        <DeleteIcon size="small"/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            { errorMessage !== '' && <h3>{errorMessage}</h3>}

            { errorMessage === ''
                && <Grid container spacing={1} direction='column' alignItems='flex-start'>
                    <Grid item>
                        {t('Player')}: {game.playername}
                    </Grid>
                    <Grid item>
                        {t('Bot')}: {game.botname}
                    </Grid>
                    <Grid item>
                        {t('Bot URL')}: {game.botURL}
                    </Grid>
                    <Grid item>
                        {t('Maze')}: {game.mazename}
                    </Grid>
                    <Grid item>
                        {t('State')}: {game.state}
                    </Grid>
                    <Grid item>
                        {t('Steps')}: {game.steps}
                    </Grid>

                </Grid>
            }
        </Paper>
    );
}
