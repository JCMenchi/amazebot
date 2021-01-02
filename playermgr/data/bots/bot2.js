"use strict";

console.log('Loading BOT2...');

/*
    This bot run in circle
*/
function executeStep(room) {
    const result = { action: 'nop' };

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

    // move somewhere
    if (room.left === 'door') {
        result.action = 'move';
        result.direction = 'left';
    } else if (room.right === 'door') {
        result.action = 'move';
        result.direction = 'right';
    } else if (room.left === 'down') {
        result.action = 'move';
        result.direction = 'down';
    } else if (room.up === 'door') {
        result.action = 'move';
        result.direction = 'up';
    }
    
    return result;
}