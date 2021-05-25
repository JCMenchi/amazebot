import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent, CardActions, IconButton, Grid } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ReplayIcon from '@material-ui/icons/Replay';
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

    const [errorMessage, setErrorMessage] = useState('');

    const [game, setGame] = useState({});

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        loadData();
    }, [props.gameId]);

    const loadData = () => {
        setErrorMessage('');
        gameService
            .get("/api/games/" + props.gameId)
            .then((response) => {
                setGame(response.data);
            })
            .catch((error) => {
                if (error.response) {
                    setErrorMessage(error.response.statusText);
                } else {
                    setErrorMessage(error.message);
                }
            });
    }

    const handleEdit = (event, game_id) => {
        LOGGER.info(`Reset game ${game_id}`);
        gameService
            .patch("api/games/" + game_id, { state: 'init', steps: 0, bot_result: {} })
            .then((response) => {
                loadData();
            })
            .catch((error) => {
                console.error('Error when resteing game', error);
            });
    }

    const handleReload = (event, game_id) => {
        LOGGER.info(`Reload game ${game_id}`);
        loadData();
    }

    const handleRun = (event, game_id) => {
        LOGGER.info(`Run game ${game_id}`);
        gameService
            .post("api/games/" + game_id + "/start")
            .then((response) => {
                LOGGER.info(`Game ${game_id} started.`);
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

    const handleDelete = (event, game_id) => {
        LOGGER.info(`Delete game ${game_id}`);
        gameService
            .delete("api/games/" + game_id)
            .then((response) => {
                LOGGER.info(`Game ${game_id} deleted.`);
                props.reload();
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.data) {
                        // data is an object like { error: 101, message: 'error message'}
                        LOGGER.error(`Error while deleting game ${game_id}: ${error.response.data.message}`);
                    } else {
                        LOGGER.error(`Error while deleting game ${game_id}: ${error.response.statusText}`);
                    }
                } else {
                    LOGGER.error(`Error while deleting game ${game_id}: ${error.message}`);
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
            <CardContent style={{ height: 300, width: 300 }}>
                    { game && game.mazeConfiguration && 
                        <MazeViewer readonly={true} cellWidth={20} cellHeight={20}
                                cellMargin={4} maze={getMazeDef(game)} /> }
            </CardContent>
            <CardActions disableSpacing>

                <IconButton size="small" color="inherit" onClick={(event) => handleRun(event, game.id)}>
                    <PlayArrowIcon size="small" />
                </IconButton>
                <IconButton size="small" color="inherit" onClick={(event) => handleReload(event, game.id)}>
                    <ReplayIcon size="small" />
                </IconButton>
                <IconButton size="small" color="inherit" onClick={(event) => handleEdit(event, game.id)}>
                    <EditIcon size="small" />
                </IconButton>
                <IconButton size="small" edge="end" color="inherit" onClick={(event) => handleDelete(event, game.id)}>
                    <DeleteIcon size="small" />
                </IconButton>
            </CardActions>
        </Card>

    );
}
