import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Grid, Paper } from '@material-ui/core';
import { useParams } from 'react-router-dom';

import MazeDetails from './MazeDetails';
import mazeService from '../utils/player_service';

/**
 * Maze Manager Component
 * 
 */
export default function MazeManager(props) {
    const history = useHistory();

    // for I18N
    const { t } = useTranslation();

    const { playerId } = useParams();

    // Store the players in a state variable.
    // We are passing an empty array as the default value.
    const [mazes, setMazes] = useState([]);

    // message to display when nothing is selected or after an error
    const [errorMessage, setErrorMessage] = useState(t('Please select a maze.'));

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        loadMaze(-1);
    }, []);

    const loadMaze = (id) => {
        mazeService
            .get("api/mazes")
            .then((response) => {
                setMazes(response.data);
                // if id is -1, it is the useEffect loading do not modify history
                if (id !== -1) {
                    if (id) {
                        history.push(`/mazes/${id}`);
                    } else {
                        history.push('/mazes');
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

    return (
        <Paper elevation={4} variant='elevation' style={{ padding: 4, height: '100%', width: '100%', overflow: 'hidden' }}>
            <Grid container spacing={2}>

                {mazes.map(item => (
                    <Grid item key={item.id} style={{ height: 400, width: 300 }}>
                        <MazeDetails style={{ height: 400, width: 300 }} playerId={playerId} mazeId={item.id} />
                    </Grid>
                ))}

            </Grid>

        </Paper>
    );
}