import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Fab, Paper, Grid } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { useParams } from 'react-router-dom';

import BotAddDialog from './BotAdd';
import BotDetails from './BotDetails';
import playerService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Bot Manager Component
 * 
 */
export default function BotManager(props) {

    const history = useHistory();

    const { playerId } = useParams();

    // Store the bots in a state variable.
    // We are passing an empty array as the default value.
    const [bots, setBots] = useState([]);

    // message to display when nothing is selected or after an error
    const [errorMessage, setErrorMessage] = useState('');

    // is Add Player dialog open
    const [openAddDialog, setOpenAddDialog] = React.useState(false);

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        loadBots(-1);
    }, []);

    const loadBots = (id) => {
        playerService
            .get(`/api/players/${playerId}/bot`)
            .then((response) => {
                setBots(response.data);
                if (id !== -1) {
                    if (id) {
                        history.push(`/players/${playerId}/bot/${id}`);
                    } else {
                        history.push(`/players/${playerId}/bot`);
                    }
                }
            })
            .catch((error) => {
                if (error.response.data) {
                    // data is an object like { error: 101, message: 'error message'}
                    setErrorMessage(error.response.data.message);
                } else {
                    setErrorMessage(error.response.statusText);
                }
            });
    }

    // Add player dialog management
    const handleAddBot = (event) => {
        // show dialog
        setOpenAddDialog(true);
    }

    const handleCloseAddDialog = (value) => {
        LOGGER.info(`Add bot: ${JSON.stringify(value)}`);
        setOpenAddDialog(false);
        if (value.error) {
            setErrorMessage(value.message);
        } else if (value.id) {
            loadBot(value.id);
        }
    };

    return (
        <Paper elevation={4} variant='elevation' style={{ padding: 4, height: '100%', width: '100%', overflow: 'hidden' }}>
            <Grid container spacing={2}>

                {bots.map(item => (
                    <Grid item key={item.id}>
                        <BotDetails playerId={playerId} botId={item.id} />
                    </Grid>
                ))}

                <Fab size="small" color="primary" aria-label="add"
                    onClick={(event) => handleAddBot(event)}>
                    <AddIcon />
                </Fab>
                <BotAddDialog playerId={playerId} open={openAddDialog} onClose={handleCloseAddDialog} />

            </Grid>
        </Paper>
    );
}
