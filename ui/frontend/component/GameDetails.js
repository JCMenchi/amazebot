import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Fab, Grid, Paper } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';


import gameService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Game Detail Component
 * 
 */
export default function GameDetails(props) {

    // for I18N
    const { t } = useTranslation();

    const { gameId }= useParams();

    const [errorMessage, setErrorMessage] = useState('');

    const [game, setGame] = useState({});

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
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
    }, [gameId]);

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
            { errorMessage !== '' && <h3>{errorMessage}</h3>}

            { errorMessage === '' 
                && <Grid container spacing={1} direction='column' alignItems='flex-start'>
                    <Grid item>
                        Id: {game.id}
                    </Grid>
                    <Grid item>
                        PlayerId: {game.playerid}
                    </Grid>
                    <Grid item>
                        BotId: {game.botid}
                    </Grid>
                    <Grid item>
                        Bot URL: {game.botURL}
                    </Grid>
                    <Grid item>
                        MazeId: {game.mazeid}
                    </Grid>
                    <Grid item>
                        State: {game.state}
                    </Grid>
                    <Grid item>
                        Steps: {game.steps}
                    </Grid>

                </Grid>
            }
            <Fab size="small" style={{ position: 'absolute' }} color="primary" className="fabright" aria-label="delete"
                onClick={(event) => handleDelete(event, game.id)}>
                <DeleteIcon />
            </Fab>
        </Paper>
    );
}
