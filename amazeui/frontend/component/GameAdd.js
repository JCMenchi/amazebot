import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';

import gameService from '../utils/player_service';

export default function GameAddDialog(props) {

    const { onClose, open } = props;

    // for I18N
    const { t } = useTranslation();

    const handleClose = () => {
        onClose('');
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby="game-add-dialog-title" open={open}>
            <DialogTitle id="game-add-dialog-title">{t('Create new game')}</DialogTitle>

            <Formik
                initialValues={{
                    playerid: '',
                    botid: '',
                    mazeid: ''
                }}
                validate={values => {
                    const errors = {};
                    if (!values.playerid) {
                        errors.playerid = 'Required';
                    } else if (values.playerid === '') {
                        errors.playerid = 'Required';
                    }

                    if (!values.botid) {
                        errors.botid = 'Required';
                    } else if (values.botid === '') {
                        errors.botid = 'Required';
                    }

                    if (!values.mazeid) {
                        errors.mazeid = 'Required';
                    } else if (values.mazeid === '') {
                        errors.mazeid = 'Required';
                    }

                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    gameService
                    .post("api/games", { mazeid: Number(values.mazeid), 
                                         playerid: Number(values.playerid),
                                         botid: Number(values.botid)})
                    .then((response) => {
                        setSubmitting(false);
                        // data is an object
                        onClose(response.data);
                    })
                    .catch((error) => {
                        setSubmitting(false);
                        if (error.response.data) {
                            // data is an object
                            onClose(error.response.data);
                        } else {
                            onClose(error.response.statusText);
                        }
                    });
                }}
            >
                {({ submitForm, isSubmitting }) => (
                    <Form>
                        <Box margin={2}>
                            <Field
                                component={TextField}
                                name="playerid"
                                type="text"
                                label={t('playerid')}
                            />
                            <Field
                                component={TextField}
                                name="botid"
                                type="text"
                                label={t('botid')}
                            />
                            <Field
                                component={TextField}
                                name="mazeid"
                                type="text"
                                label={t('mazeid')}
                            />
                            {isSubmitting && <LinearProgress />}
                            <br />
                            <Box marginTop={1}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    style={{ marginRight: 8 }}
                                    disabled={isSubmitting}
                                    onClick={submitForm}>
                                    {t('Create')}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={isSubmitting}
                                    onClick={handleClose}>
                                    {t('Cancel')}
                                </Button>
                            </Box>
                        </Box>
                    </Form>
                )}
            </Formik>

        </Dialog>
    );
}

GameAddDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};
