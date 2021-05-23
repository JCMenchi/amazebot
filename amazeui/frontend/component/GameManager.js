import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Paper, Grid } from '@material-ui/core';
import { useParams } from 'react-router-dom';

import GameDetails from './GameDetails';
import gameService from '../utils/player_service';

/**
 * Game Manager Component
 * 
 */
export default function GameManager(props) {
    
    // for I18N
    const { t } = useTranslation();

    const { playerId } = useParams();

    // Store the players in a state variable.
    // We are passing an empty array as the default value.
    const [games, setGames] = useState([]);

    // message to display when nothing is selected or after an error
    const [errorMessage, setErrorMessage] = useState(t('Please select a game.'));

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        loadGame();
    }, []);

    const loadGame = () => {
        gameService
        .get("/api/games")
        .then((response) => {
            setGames(response.data);
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

    return (
        <Paper elevation={4} variant='elevation' style={{ padding: 4, height: '100%', width: '100%', overflow: 'hidden' }}>

            <Grid container spacing={2}>

                {games.map(item => (
                    <Grid item key={item.id}>
                        <GameDetails gameId={item.id} />
                    </Grid>
                ))}

            </Grid>
        </Paper>
    );
}