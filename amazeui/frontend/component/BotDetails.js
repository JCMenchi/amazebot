import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent, CardActions, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

import playerService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Bot Detail Component
 * 
 */
export default function BotDetails(props) {

    // for I18N
    const { t } = useTranslation();

    const [errorMessage, setErrorMessage] = useState('');

    const [bot, setBot] = useState({});

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        playerService
            .get("/api/players/" + props.playerId + "/bot/" + props.botId)
            .then((response) => {
                setBot(response.data);
            })
            .catch((error) => {
                setErrorMessage(error.response.statusText);
            });
    }, [props.botId]);

    const handleDelete = (event, bot_id) => {
        LOGGER.info(`Delete bot ${bot_id}`);
        playerService
            .delete("api/players/" + props.playerId + "/bot/" + bot_id)
            .then((response) => {
                LOGGER.info(`Bot ${bot_id} deleted.`);
                props.reload();
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.data) {
                        // data is an object like { error: 101, message: 'error message'}
                        LOGGER.error(`Error while deleting bot ${bot_id}: ${error.response.data.message}`);
                    } else {
                        LOGGER.error(`Error while deleting bot ${bot_id}: ${error.response.statusText}`);
                    }
                } else {
                    LOGGER.error(`Error while deleting bot ${bot_id}: ${error.message}`);
                }
            });
    }

    return (

        <Card raised>
            <CardHeader
                title={`${bot.name} (${bot.id})`}
                subheader={bot.url}
            />
            <CardContent>
                content
                </CardContent>
            <CardActions disableSpacing>

                <IconButton aria-label="add to favorites" onClick={(event) => handleDelete(event, bot.id)}>
                    <DeleteIcon />
                </IconButton>
            </CardActions>
        </Card>

    );
}
