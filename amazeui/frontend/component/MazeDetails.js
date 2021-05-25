import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent, CardActions, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import GameCreateDialog from './GameCreateDialog';

import Maze from '../maze/maze';
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

    // is Add Game dialog open
    const [openCreateDialog, setOpenCreateDialog] = React.useState(false);

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        setErrorMessage('');
        mazeService
            .get("/api/mazes/" + props.mazeId)
            .then((response) => {
                const mazeRemoteObject = response.data;
                mazeRemoteObject.mazeLocal = new Maze(mazeRemoteObject.configuration.maze);
                setMaze(mazeRemoteObject);
            })
            .catch((error) => {
                if (error.response) {
                    setErrorMessage(error.response.statusText);
                } else {
                    setErrorMessage(error.message);
                }
            });
    }, [props.mazeId]);

    // Add Game dialog management
    const handleCreateGame = (event) => {
        // show dialog
        setOpenCreateDialog(true);
    }

    const handleCloseCreateDialog = (value) => {
        LOGGER.info(`Add game: ${JSON.stringify(value)}`);
        setOpenCreateDialog(false);
        if (value.error) {
            setErrorMessage(value.message);
        }
    };

    /**
     * 
     * @param {Maze} maze 
     */
    const handleSave = (event, maze_id, maze) => {
        
    }

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
                {maze && maze.mazeLocal && 
                <MazeViewer readonly={false} cellWidth={20} cellHeight={20} cellMargin={4} maze={maze.mazeLocal} />}
            </CardContent>
            <CardActions disableSpacing>
                <IconButton size="small" color="inherit" onClick={(event) => handleCreateGame(event, maze.id)}>
                    <PlayArrowIcon size="small" />
                </IconButton>
                <IconButton size="small" color="inherit" onClick={(event) => handleSave(event, maze.id)}>
                    <SaveIcon size="small" />
                </IconButton>
                <IconButton aria-label="add to favorites" onClick={(event) => handleDelete(event, maze.id)}>
                    <DeleteIcon />
                </IconButton>
                <GameCreateDialog open={openCreateDialog} playerId={props.playerId} mazeId={maze.id} onClose={handleCloseCreateDialog} />
            </CardActions>
        </Card>

    );
}
