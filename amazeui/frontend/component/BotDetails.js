import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent, CardActions, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Editor from "@monaco-editor/react";

import playerService from '../utils/player_service';
import LOGGER from '../utils/uilogger';

/**
 * Bot Detail Component
 * 
 */
export default function BotDetails(props) {

    // for I18N
    const { t } = useTranslation();

    const [bot, setBot] = useState({});

    const [botcode, setBotcode] = useState('');

    const editorRef = useRef(null);

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        editor.updateOptions({ readOnly: true })
    }

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        playerService
            .get("/api/players/" + props.playerId + "/bot/" + props.botId)
            .then((response) => {
                setBot(response.data);

                playerService
                .get("/api/players/" + props.playerId + "/bot/" + props.botId + "/code")
                .then((response) => {
                    if (response.data.botcode) {
                        setBotcode(response.data.botcode);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });

            })
            .catch((error) => {
                console.error(error.response.statusText);
            });
    }, [props.botId]);

    const handleEdit = (event, botid) => {
        editorRef.current.updateOptions({ readOnly: false })
    }

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
            <CardActions disableSpacing>
                <IconButton size="small" color="inherit" onClick={(event) => handleEdit(event, bot.id)}>
                    <EditIcon size="small" />
                </IconButton>
                <IconButton aria-label="add to favorites" onClick={(event) => handleDelete(event, bot.id)}>
                    <DeleteIcon />
                </IconButton>
            </CardActions>
            <CardContent>
            <Editor
                width="400px"
                height="200px"
                defaultLanguage="javascript"
                defaultValue={botcode}
                onMount={handleEditorDidMount}
            />
            </CardContent>
            
        </Card>

    );
}
