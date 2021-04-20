import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route, Switch, useHistory } from 'react-router-dom';
import { Fab, Paper, List, ListItem, ListItemText } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import MazeAddDialog from './MazeAdd';
import MazeDetails from './MazeDetails';
import mazeService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Maze Manager Component
 * 
 */
export default function MazeManager(props) {
    const history = useHistory();

    // for I18N
    const { t } = useTranslation();

    // Store the players in a state variable.
    // We are passing an empty array as the default value.
    const [mazes, setMazes] = useState([]);

    // message to display when nothing is selected or after an error
    const [errorMessage, setErrorMessage] = useState(t('Please select a maze.'));

    // is Add Player dialog open
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
   
    // current player
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
    };

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        loadMaze();
    }, []);

    const loadMaze = (id) => {
        mazeService
        .get("api/mazes")
        .then((response) => {
            setMazes(response.data);
            if (id) {
                history.push(`/mazes/${id}`);
            } else {
                history.push('/mazes');
            }
        })
        .catch((error) => {
            setErrorMessage(error.response.statusText);
        });
    }

    // Add Maze dialog management
    const handleAddMaze = (event) => {
        // show dialog
        setOpenAddDialog(true);
    }

    const handleCloseAddDialog = (value) => {
        LOGGER.info(`Add maze: ${JSON.stringify(value)}`);
        setOpenAddDialog(false);
        if (value.error) {
            setErrorMessage(value.message);
        } else if (value.id) {
            loadMaze(value.id);
        }
    };

    return (
        <Paper elevation={4} variant='elevation' style={{ padding: 4, height: '100%', width: '100%', overflow: 'hidden' }}>
            
            {  <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                    <nav>
                        <List>
                            {mazes.map(item => (
                                <ListItem key={item.id} button component={Link} to={`${props.match.url}/${item.id}`}
                                          selected={selectedIndex === item.id}
                                          onClick={(event) => handleListItemClick(event, item.id)}>
                                    <ListItemText primary={item.name} />
                                </ListItem>
                            ))}
                        </List>
                        <Fab size="small" color="primary" aria-label="add"
                             onClick={(event) => handleAddMaze(event)}>
                            <AddIcon />
                        </Fab>
                        <MazeAddDialog open={openAddDialog} onClose={handleCloseAddDialog} />
                    </nav>
                    <main style={{ marginLeft: 4, flexGrow: 1 }}>
                        <Switch>
                            <Route path={`${props.match.url}/:mazeId`} 
                                   render={(props) => (<MazeDetails {...props} reload={loadMaze} />)}/>
                            <Route exact path={props.match.url} render={() => <h3>{errorMessage}</h3>} />
                        </Switch>
                    </main>
                </div>
            }
        </Paper>
    );
}