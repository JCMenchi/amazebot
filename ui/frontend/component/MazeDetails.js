import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Fab, Grid, Paper } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

import mazeService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Player Detail Component
 * 
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
                setErrorMessage(error.response.statusText);
            });
    }, [mazeId]);

    const handleDelete = (event, maze_id) => {
        LOGGER.info(`Delete maze ${maze_id}`);
        mazeService
            .delete("api/mazes/" + maze_id)
            .then((response) => {
                LOGGER.info(`Maze ${maze_id} deleted.`);
                props.reload();
            })
            .catch((error) => {
                LOGGER.error(`Error while deleting player ${maze_id}: ${error}`);
            });
    }

    return (
        <Paper elevation={4} variant='outlined' style={{ padding: 4 }}>
            { errorMessage !== '' && <h3>{errorMessage}</h3>}

            { errorMessage === ''
                && <Grid container spacing={1} direction='column' alignItems='flex-start'>
                    <Grid item>
                        Id: {maze.id}
                    </Grid>
                    <Grid item>
                        {t('Name')}: {maze.name}
                    </Grid>
                    <Grid item>
                        {t('Description')}: {maze.description}
                    </Grid>

                    {maze.configuration && Array.isArray(maze.configuration) && maze.configuration.map(item => (
                        <Grid item>
                            {item}
                        </Grid>
                    ))}
                    {maze.configuration && !Array.isArray(maze.configuration) &&
                        <Grid item>
                            {t('Configuration')}: {maze.configuration}
                        </Grid>
                    }
                    <Fab size="small" color="primary" aria-label="delete"
                        onClick={(event) => handleDelete(event, maze.id)}>
                        <DeleteIcon />
                    </Fab>
                </Grid>
            }
        </Paper>
    );
}
