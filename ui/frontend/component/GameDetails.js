import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Grid, Paper } from '@material-ui/core';

import playerService from '../utils/player_service';

/**
 * Game Detail Component
 * 
 * @param {Object} props 
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
        playerService
        .get("/api/games/" + gameId)
        .then((response) => {
            setGame(response.data);
        })
        .catch((error) => {
            setErrorMessage(error.response.statusText);
        });
    }, [gameId]);

    return (
        <Paper elevation={4} variant='outlined' style={{padding: 4}}>
            { errorMessage !== '' && <h3>{errorMessage}</h3>}

            { errorMessage === '' 
                && <Grid container spacing={1} direction='column' alignItems='flex-start'>
                    <Grid item>
                        Name: {game.name}
                    </Grid>
                    <Grid item>
                        Id: {game.id}
                    </Grid>
                </Grid>
            }
        </Paper>
    );
}
