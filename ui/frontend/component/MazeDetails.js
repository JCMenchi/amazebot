import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Grid, Paper } from '@material-ui/core';

import mazeService from '../utils/player_service';

/**
 * Player Detail Component
 * 
 * @param {Object} props 
 */
export default function MazeDetails(props) {

    // for I18N
    const { t } = useTranslation();

    const { mazeId } = useParams();

    const [errorMessage, setErrorMessage] = useState('');

    const [maze, setMaze] = useState({});

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        mazeService
            .get("/api/mazes/" + mazeId)
            .then((response) => {
                setMaze(response.data);
            })
            .catch((error) => {
                setErrorMessage(error.response.data);
            });
    }, [mazeId]);

    return (
        <Paper elevation={4} variant='outlined' style={{padding: 4}}>
            { errorMessage !== '' && <h3>{errorMessage}</h3>}

            { errorMessage === ''
                && <Grid container spacing={1} direction='column' alignItems='flex-start'>
                    <Grid item>
                        Name: {maze.name}
                    </Grid>
                    <Grid item>
                        Description: {maze.description}
                    </Grid>
                    <Grid item>
                        Id: {maze.id}
                    </Grid>
                    {maze.configuration && maze.configuration.map(item => (
                        <Grid item>
                            {item}
                        </Grid>
                    ))}

                </Grid>
            }
        </Paper>
    );
}
