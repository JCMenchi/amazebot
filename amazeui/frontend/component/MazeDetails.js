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

    const [maze, setMaze] = useState({});

    const [bots, setBots] = useState([]);

    // is Add Game dialog open
    const [openCreateDialog, setOpenCreateDialog] = React.useState(false);

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        mazeService
            .get("/api/mazes/" + props.mazeId)
            .then((response) => {
                const mazeRemoteObject = response.data;
                if (mazeRemoteObject.configuration && mazeRemoteObject.configuration.maze) {
                    mazeRemoteObject.mazeLocal = new Maze(mazeRemoteObject.configuration.maze);
                } else {
                    mazeRemoteObject.mazeLocal = new Maze();
                }
                setMaze(mazeRemoteObject);
            })
            .catch((error) => {
                if (error.response) {
                    console.error(error.response.statusText);
                } else {
                    console.error(error.message);
                }
            });
    }, [props.mazeId]);

    // Add Game dialog management
    const handleCreateGame = () => {

        mazeService.get("/api/players/" + props.playerId + "/bot",)
        .then((response) => {
            const bots = [];
            for(const b of response.data) {
                bots.push({id: b.id, name: b.name});
            }
            setBots(bots);
            // show dialog
            setOpenCreateDialog(true);
        })
        .catch((error) => {
            if (error.response) {
                console.error(error.response.statusText);
            } else {
                console.error(error.message);
            }
        });
    }

    const handleCloseCreateDialog = (result) => {
        LOGGER.info('Add game', result);
        setOpenCreateDialog(false);
    };

    const handleSave = () => {
        const mconf = maze.mazeLocal.getConfForSave();
        mazeService
            .patch("/api/mazes/" + props.mazeId, {configuration: mconf})
            .then((response) => {
                const mazeRemoteObject = response.data;
                if (mazeRemoteObject.configuration && mazeRemoteObject.configuration.maze) {
                    mazeRemoteObject.mazeLocal = new Maze(mazeRemoteObject.configuration.maze);
                } else {
                    mazeRemoteObject.mazeLocal = new Maze(DEFAULT_MAZE);
                }
                setMaze(mazeRemoteObject);
            })
            .catch((error) => {
                if (error.response) {
                    console.error(error.response.statusText);
                } else {
                    console.error(error.message);
                }
            });
    }

    const handleDelete = () => {
        LOGGER.info(`Delete maze ${props.mazeId}`);

        mazeService
            .delete("api/mazes/" + props.mazeId)
            .then((response) => {
                LOGGER.info(`Maze ${props.mazeId} deleted.`);
                props.reload();
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.data) {
                        // data is an object like { error: 101, message: 'error message'}
                        LOGGER.error(`Error while deleting maze ${props.mazeId}: ${error.response.data.message}`);
                    } else {
                        LOGGER.error(`Error while deleting maze ${props.mazeId}: ${error.response.statusText}`);
                    }
                } else {
                    LOGGER.error(`Error while deleting maze ${props.mazeId}: ${error.message}`);
                }
            });
    }

    return (
        <Card raised>
            <CardHeader
                title={maze && `${maze.name} (${props.mazeId})`}
                subheader={maze && maze.description}
            />
            <CardActions disableSpacing>
                <IconButton size="small" color="inherit" onClick={(event) => handleCreateGame()}>
                    <PlayArrowIcon size="small" />
                </IconButton>
                <IconButton size="small" color="inherit" onClick={(event) => handleSave()}>
                    <SaveIcon size="small" />
                </IconButton>
                <IconButton  size="small" color="inherit" onClick={(event) => handleDelete()}>
                    <DeleteIcon  size="small"/>
                </IconButton>
            </CardActions>
            <CardContent style={{ padding: 8, height: 316, width: 316 }}>
                {maze && maze.mazeLocal && 
                <MazeViewer height={300} width={300} readonly={false} cellWidth={20} cellHeight={20} cellMargin={4} maze={maze.mazeLocal} />}
            </CardContent>

            <GameCreateDialog botList={bots} open={openCreateDialog} 
                              playerId={props.playerId} 
                              mazeId={maze.id} mazeName={maze.name}
                              onClose={handleCloseCreateDialog} />
        </Card>

    );
}
