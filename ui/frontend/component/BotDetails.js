import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Fab, Grid, Paper } from '@material-ui/core';
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

    const { botId } = useParams();

    const [errorMessage, setErrorMessage] = useState('');

    const [bot, setBot] = useState({});

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        playerService
            .get("/api/players/" + props.playerid + "/bot/" + botId)
            .then((response) => {
                setBot(response.data);
            })
            .catch((error) => {
                setErrorMessage(error.response.statusText);
            });
    }, [botId]);

    const handleDelete = (event, bot_id) => {
        LOGGER.info(`Delete bot ${bot_id}`);
        playerService
            .delete("api/players/" + props.playerid + "/bot/" + bot_id)
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
        <Paper elevation={4} variant='outlined' style={{ padding: 4, paddingRight: 60, paddingBottom: 30, position: 'relative' }}>
            { errorMessage !== '' && <h3>{errorMessage}</h3>}

            { errorMessage === ''
                && <Grid container spacing={1} direction='column' alignItems='flex-start'>
                    <Grid item>
                        Id: {bot.id}
                    </Grid>
                    <Grid item>
                        {t('Name')}: {bot.name}
                    </Grid>
                    <Grid item>
                        {t('URL')}: {bot.url}
                    </Grid>
                </Grid>
            }
            <Fab size="small" style={{ position: 'absolute' }} color="primary" className="fabright" aria-label="delete"
                onClick={(event) => handleDelete(event, bot.id)}>
                <DeleteIcon />
            </Fab>
        </Paper>
    );
}
