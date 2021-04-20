import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Fab, Grid, Paper } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

import playerService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Player Detail Component
 * 
 */
export default function PlayerDetails(props) {

    // for I18N
    const { t } = useTranslation();
    
    const { playerId } = useParams();

    const [errorMessage, setErrorMessage] = useState('');

    const [player, setPlayer] = useState({});

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        playerService
            .get("api/players/" + playerId)
            .then((response) => {
                setPlayer(response.data);
            })
            .catch((error) => {
                setErrorMessage(error.response.statusText);
            });
    }, [playerId]);

    const handleDelete = (event, player_id) => {
        LOGGER.info(`Delete player ${player_id}`);
        playerService
            .delete("api/players/" + player_id)
            .then((response) => {
                LOGGER.info(`Player ${player_id} deleted.`);
                props.reload();
            })
            .catch((error) => {
                LOGGER.error(`Error while deleting player ${player_id}: ${error}`);
            });
    }

    return (
        <Paper elevation={4} variant='outlined' style={{padding: 4}}>
            { errorMessage !== '' && <h3>{errorMessage}</h3>}

            { errorMessage === ''
                && <Grid container spacing={1} direction='column' alignItems='flex-start'>
                    <Grid item>
                        Id: {player.id}
                    </Grid>
                    <Grid item>
                        {t('Name')}: {player.name}
                    </Grid>

                    <Fab size="small" color="primary" aria-label="delete"
                        onClick={(event) => handleDelete(event, player.id)}>
                        <DeleteIcon />
                    </Fab>
                </Grid>
            }
        </Paper>
    );
}
