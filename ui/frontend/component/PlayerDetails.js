import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Grid, Paper } from '@material-ui/core';

import playerService from '../utils/player_service';

/**
 * Player Detail Component
 * 
 * @param {Object} props 
 */
export default function PlayerDetails(props) {

    // for I18N
    const { t } = useTranslation();

    const { playerId }= useParams();

    const [errorMessage, setErrorMessage] = useState('');

    const [player, setPlayer] = useState({});

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        playerService
        .get("/api/players/" + playerId)
        .then((response) => {
            setPlayer(response.data);
        })
        .catch((error) => {
            setErrorMessage(error.response.data);
        });
    }, [playerId]);

    return (
        <Paper elevation={4} variant='outlined' style={{padding: 4}}>
            { errorMessage !== '' && <h3>{errorMessage}</h3>}

            { errorMessage === '' 
                && <Grid container spacing={1} direction='column' alignItems='flex-start'>
                    <Grid item>
                        Name: {player.name}
                    </Grid>
                    <Grid item>
                        Id: {player.id}
                    </Grid>
                </Grid>
            }
        </Paper>
    );
}
