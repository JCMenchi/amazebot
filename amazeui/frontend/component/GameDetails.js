import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent, CardActions, IconButton, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import MazeViewer from '../maze/MazeViewer';

import Maze from '../maze/maze';

import gameService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Game Detail Component
 * 
 */
export default function GameDetails(props) {

    // for I18N
    const { t } = useTranslation();

    const [game, setGame] = useState({});

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        loadData();
    }, [props.gameId]);

    const loadData = () => {
        gameService
            .get("/api/games/" + props.gameId)
            .then((response) => {
                setGame(response.data);
            })
            .catch((error) => {
                if (error.response) {
                    console.error(error.response.statusText);
                } else {
                    console.error(error.message);
                }
            });
    }

    const handleEdit = () => {
        LOGGER.info(`Reset game ${props.gameId}`);
        gameService
            .patch("api/games/" + props.gameId, { state: 'init', steps: 0, bot_result: {} })
            .then((response) => {
                loadData();
            })
            .catch((error) => {
                console.error('Error when resteing game', error);
            });
    }

    const handleReload = () => {
        LOGGER.info(`Reload games`);
        loadData();
    }

    const handleRun = () => {
        LOGGER.info(`Run game ${props.gameId}`);
        gameService
            .post("api/games/" + props.gameId + "/start")
            .then((response) => {
                LOGGER.info(`Game ${props.gameId} started.`);
                loadData();
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.data) {
                        // data is an object like { error: 101, message: 'error message'}
                        LOGGER.error(`Error while starting game ${game_id}: ${error.response.data.message}`);
                    } else {
                        LOGGER.error(`Error while starting game ${game_id}: ${error.response.statusText}`);
                    }
                } else {
                    LOGGER.error(`Error while starting game ${game_id}: ${error.message}`);
                }
            });
    }

    const handleDelete = () => {
        LOGGER.info(`Delete game ${props.gameId}`);
        gameService
            .delete("api/games/" + props.gameId)
            .then((response) => {
                LOGGER.info(`Game ${props.gameId} deleted.`);
                props.reload();
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.data) {
                        // data is an object like { error: 101, message: 'error message'}
                        LOGGER.error(`Error while deleting game ${props.gameId}: ${error.response.data.message}`);
                    } else {
                        LOGGER.error(`Error while deleting game ${props.gameId}: ${error.response.statusText}`);
                    }
                } else {
                    LOGGER.error(`Error while deleting game ${props.gameId}: ${error.message}`);
                }
            });
    }

    const getMazeDef = (game) => {
        if (game.bot_result && game.bot_result.maze) {
            return new Maze(game.bot_result.maze);
        } else if (game.mazeConfiguration && game.mazeConfiguration.maze) {
            return new Maze(game.mazeConfiguration.maze);
        } else {
            return null;
        }
    }

    return (
        <Card raised>
            <CardHeader
                title={`${game.playername}.${game.botname} on ${game.mazename}`}
                subheader={`${t('State')}: "${game.state}" ${t('Steps')}: ${game.steps} (${game.id})`}
            />

            <CardActions disableSpacing>
                <IconButton size="small" color="inherit" onClick={(event) => handleRun()}>
                    <PlayArrowIcon size="small" />
                </IconButton>
                <IconButton size="small" color="inherit" onClick={(event) => handleReload()}>
                    <ReplayIcon size="small" />
                </IconButton>
                <IconButton size="small" color="inherit" onClick={(event) => handleEdit()}>
                    <EditIcon size="small" />
                </IconButton>
                <IconButton size="small" color="inherit" onClick={(event) => handleDelete()}>
                    <DeleteIcon size="small" />
                </IconButton>
            </CardActions>

            <CardContent style={{ padding: 8, height: 316, width: 316 }}>
                    { game && game.mazeConfiguration && 
                        <MazeViewer width={300} height={300} readonly={true} cellWidth={20} cellHeight={20}
                                cellMargin={4} maze={getMazeDef(game)} /> }
            </CardContent>
        </Card>

    );
}
