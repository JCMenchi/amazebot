import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent, CardActions, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

import MazeViewer from '../maze/MazeViewer';
import mazeService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Maze Detail Component
 * 
 */
export default function MazeDetails(props) {

    // for I18N
    const { t } = useTranslation();

    const [errorMessage, setErrorMessage] = useState('');

    const [maze, setMaze] = useState({});

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        setErrorMessage('');
        mazeService
            .get("/api/mazes/" + props.mazeId)
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
    }, [props.mazeId]);

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
        <Card raised>
            <CardHeader
                title={maze && `${maze.name} (${maze.id})`}
                subheader={maze && maze.description}
            />
            <CardContent>
                {maze && maze.configuration && <MazeViewer cellWidth={20} cellHeight={20} cellMargin={4} mazedef={maze.configuration.maze} />}
            </CardContent>
            <CardActions disableSpacing>

                <IconButton aria-label="add to favorites" onClick={(event) => handleDelete(event, maze.id)}>
                    <DeleteIcon />
                </IconButton>
            </CardActions>
        </Card>

    );
}
