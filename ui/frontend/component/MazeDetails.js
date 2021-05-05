import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useKeycloak } from '@react-keycloak/web';
import { useParams } from 'react-router-dom';
import { Fab, Grid, Paper } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import axios from 'axios';

import mazeService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Maze Detail Component
 * 
 */
export default function MazeDetails(props) {

    // for I18N
    const { t } = useTranslation();

    const { keycloak, initialized } = useKeycloak();

    const { mazeId } = useParams();

    const [errorMessage, setErrorMessage] = useState('');

    const [maze, setMaze] = useState({});

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        setErrorMessage('');
        mazeService
            .get("/api/mazes/" + mazeId)
            .then((response) => {
                setMaze(response.data);
            })
            .catch((error) => {
                if (error.response) {
                    setErrorMessage(error.response.statusText);
                } else {
                    setErrorMessage(error.message);
                }
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
                if (error.response) {
                    if (error.response.data) {
                        setErrorMessage(error.response.statusText);
                        // data is an object like { error: 101, message: 'error message'}
                        LOGGER.error(`Error while deleting maze ${maze_id}: ${error.response.data.message}`);
                    } else {
                        setErrorMessage(error.response.statusText);
                        LOGGER.error(`Error while deleting maze ${maze_id}: ${error.response.statusText}`);
                    }
                } else {
                    setErrorMessage(error.message);
                    LOGGER.error(`Error while deleting maze ${maze_id}: ${error.message}`);
                }
            });
    }

    return (
        <Paper elevation={4} variant='outlined' style={{ padding: 4, position: 'relative' }}>
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

                    {maze.configuration && maze.configuration.maze && maze.configuration.maze.map(item => (
                        <Grid item>
                            {item}
                        </Grid>
                    ))}

                </Grid>
            }
            <Fab size="small" style={{ position: 'absolute' }} color="primary" className="fabright" aria-label="delete"
                onClick={(event) => handleDelete(event, maze.id)}>
                <DeleteIcon />
            </Fab>
        </Paper>
    );
}
