import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';

import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';

import Maze from '../maze/maze';
import mazeService from '../utils/player_service';

export default function MazeAddDialog(props) {

    const { onClose, open } = props;

    // for I18N
    const { t } = useTranslation();

    const handleClose = () => {
        onClose('');
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby="maze-add-dialog-title" open={open}>
            <DialogTitle id="maze-add-dialog-title">{t('Create new maze')}</DialogTitle>

            <Formik
                initialValues={{
                    name: '',
                    description: '',
                    nbrow: 4,
                    nbcolumn: 4
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
                    const mz = Maze.CreateMaze(Number(values.nbrow), Number(values.nbcolumn));
                    mazeService
                    .post("api/mazes", {
                        name: values.name, 
                        description: values.description,
                        configuration: mz.getConfForSave()
                    })
                    .then((response) => {
                        setSubmitting(false);
                        // data is an object like { id: 101, name: 'maze1'}
                        onClose(response.data);
                    })
                    .catch((error) => {
                        setSubmitting(false);
                        if (error.response.data) {
                            // data is an object like { error: 101, message: 'error message'}
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
                                name="name"
                                type="text"
                                label={t('Name')}
                            />
                            <Field
                                component={TextField}
                                name="description"
                                type="text"
                                label={t('Description')}
                            />
                            <Field
                                component={TextField}
                                name="nbrow"
                                type="text"
                                label={t('NbRow')}
                            />
                            <Field
                                component={TextField}
                                name="nbcolumn"
                                type="text"
                                label={t('NbColumn')}
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

MazeAddDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};
