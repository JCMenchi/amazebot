import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';

import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';

import gameService from '../utils/player_service';

export default function GameCreateDialog(props) {

    const { onClose, open, botList } = props;

    const [botId, setBotId] = useState(0);

    // for I18N
    const { t } = useTranslation();

    useEffect(() => {
        if (open && botList.length > 0) {
            setBotId(botList[0].id);
        }
    }, [open]);

    const handleClose = () => {
        gameService
            .post("api/games", {
                mazeid: props.mazeId,
                playerid: props.playerId,
                botid: botId
            })
            .then((response) => {
                // data is an object
                onClose(response.data);
            })
            .catch((error) => {
                if (error.response.data) {
                    // data is an object
                    onClose(error.response.data);
                } else {
                    onClose(error.response.statusText);
                }
            });
    };

    const handleCancel = () => {
        onClose('');
    };

    const handleChange = (event) => {
        const b = event.target.value;
        setBotId(b);
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby="game-add-dialog-title" open={open}>
            <DialogTitle id="game-add-dialog-title">{t('New game on')} {props.mazeName}</DialogTitle>
            <FormControl variant="filled">
                <InputLabel>Choose your Bot</InputLabel>
                <Select
                    id="bot"
                    value={botId}
                    onChange={handleChange}
                >
                    {
                        botList.map(item => (
                            <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                        ))
                    }
                </Select>
            </FormControl>
            <DialogActions>
                <Button onClick={handleCancel} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleClose} color="primary">
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    );
}

GameCreateDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};
