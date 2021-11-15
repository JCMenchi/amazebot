import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Fab, Grid, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

import MazeAddDialog from './MazeAddDialog';
import MazeDetails from './MazeDetails';
import mazeService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Maze Manager Component
 * 
 */
export default function MazeManager(props) {
    const navigate = useNavigate();

    // for I18N
    const { t } = useTranslation();

    const { playerId } = useParams();

    // Store the players in a state variable.
    // We are passing an empty array as the default value.
    const [mazes, setMazes] = useState([]);

    // is Add Player dialog open
    const [openAddDialog, setOpenAddDialog] = React.useState(false);

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        loadMazes(true);
    }, []);

    const loadMazes = (init) => {
        mazeService
            .get("api/mazes")
            .then((response) => {
                setMazes(response.data);
                // if id is -1, it is the useEffect loading do not modify history
                if (!init) {
                    navigate(`/players/${playerId}/mazes`);
                }
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    // data is an object like { error: 101, message: 'error message'}
                    console.error(error.response.data.message);
                } else {
                    console.error(error.message);
                }
            });
    }

    // Add maze dialog management
    const handleAddMaze = (event) => {
        // show dialog
        setOpenAddDialog(true);
    }

    const handleCloseAddDialog = (value) => {
        LOGGER.info(`Add maze: ${JSON.stringify(value)}`);
        setOpenAddDialog(false);
        if (value.error) {
            console.error(value.message);
        } else if (value.id) {
            loadMazes(false);
        }
    };

    return (
        <Paper elevation={4} variant='elevation' style={{ padding: 4, height: '100%', width: '100%', overflow: 'hidden' }}>
            <Grid container spacing={2}>

                {mazes.map(item => (
                    <Grid item key={item.id} >
                        <MazeDetails playerId={playerId} mazeId={item.id} reload={loadMazes} />
                    </Grid>
                ))}

            </Grid>
            <Fab className="fabright" size="small" color="primary" aria-label="add"
                onClick={(event) => handleAddMaze(event)}>
                <AddIcon />
            </Fab>
            <MazeAddDialog playerId={playerId} open={openAddDialog} onClose={handleCloseAddDialog} />
        </Paper>
    );
}