"use strict";

console.log('Loading BOT3...');

/*
    This bot keeps its left hand on the wall
*/

const searchOrder = {
    'right': [ 'down', 'left', 'up', 'right' ],
    'left': [ 'up', 'right', 'down', 'left' ],
    'up': [ 'right', 'down', 'left', 'up', ],
    'down': [ 'left', 'up', 'right', 'down' ]
};

const directions = [ 'up', 'right', 'down', 'left' ];

const oppositeDirection = {
    'right': 'left',
    'left': 'right',
    'up': 'down',
    'down': 'up',
    '': 'left'
};

function checkExit(room) {
    const result = {};

    // search for exit
    if (room.left === 'exit') {
        result.action = 'move';
        result.direction = 'left';
        return result;
    } else if (room.right === 'exit') {
        result.action = 'move';
        result.direction = 'right';
        return result;
    } else if (room.up === 'exit') {
        result.action = 'move';
        result.direction = 'up';
        return result;
    } else if (room.down === 'exit') {
        result.action = 'move';
        result.direction = 'down';
        return result;
    }

    return null;
}

function getDoors(room) {
    const list = [];

    for(const d of directions) {
        if (room[d] === 'door') {
            list.push(d);
        }
    }
    return list;
}

let lastBotDirection = '';

function executeStep(room) {
    const ex = checkExit(room);
    if (ex) {
        return ex;
    }

    // collect door
    const doorList = getDoors(room);
    const entryDoor = oppositeDirection[lastBotDirection];

    // select best door
    for(const d of searchOrder[entryDoor]) {
        if (doorList.includes(d)) {
            lastBotDirection = d;
            const result = {
                action: 'move',
                direction: d
            };
            return result;
        }
    }

    return { action: 'nop'};
}