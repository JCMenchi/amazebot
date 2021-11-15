import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { DropzoneArea } from 'material-ui-dropzone'

import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';

import playerService from '../utils/player_service';

export default function BotAddDialog(props) {

    const { onClose, open } = props;

    // for I18N
    const { t } = useTranslation();

    const handleClose = () => {
        onClose('');
    };

    const handleFileDrop = (files, setFieldValue) => {
        if (files.length > 0) {
            setFieldValue('filename', files[0].name);
            const reader = new FileReader();
            reader.onload = function (loadEvent) {
                if (loadEvent.target.readyState != 2)
                  return;
                if (loadEvent.target.error) {
                  alert("Error while reading file " + files[0].name + ": " + loadEvent.target.error);
                  return;
                }
                setFieldValue('botcode', loadEvent.target.result);
              };
            reader.readAsText(files[0]);
        } else {
            setFieldValue('filename', '');
            setFieldValue('botcode', '');
        }
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby="bot-add-dialog-title" open={open}>
            <DialogTitle id="bot-add-dialog-title">{t('Create new bot')}</DialogTitle>

            <Formik
                initialValues={{
                    name: '',
                    botcode: '',
                    filename: ''
                }}
                validate={values => {
                    const errors = {};
                    if (!values.name) {
                        errors.name = 'Required';
                    } else if (values.name === '') {
                        errors.name = 'Required';
                    }
                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    playerService
                        .post("api/players/" + props.playerId + "/bot", 
                            { name: values.name, filename: values.filename, botcode: values.botcode })
                        .then((response) => {
                            setSubmitting(false);
                            // data is an object like { id: 101, name: 'player1'}
                            onClose(response.data);
                        })
                        .catch((error) => {
                            setSubmitting(false);
                            if (error.response && error.response.data) {
                                // data is an object like { error: 101, message: 'error message'}
                                onClose(error.response.data);
                            } else {
                                onClose(error.response.statusText);
                            }
                        });
                }}
            >
                {({ submitForm, isSubmitting, setFieldValue }) => (
                    <Form>
                        <Box margin={2}>
                            <Field
                                component={TextField}
                                name="name"
                                type="text"
                                label={t('Name')}
                            />
                            <DropzoneArea dropzoneText="Drop bot javascript code"
                                acceptedFiles={[".js"]}
                                filesLimit={1}
                                showFileNames={true}
                                onChange={ (files) => handleFileDrop(files, setFieldValue)} />
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

BotAddDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    playerId: PropTypes.string.isRequired
};
