'use strict';

const fs = require('fs');

/**
 * Position in Maze.
 * 
 * 
 */
class Position {
    /**
     * Create a position object.
     * 
     * @param {number} i - row index
     * @param {number} j - column index
     * @param {Maze} maze - Maze
     */
    constructor(i, j, maze) {
        /** @member {number} */
        this.row = i;
        /** @member {number} */
        this.column = j;
        /** @member {Maze} */
        this.maze = maze;
        /** @member {boolean} */
        this.exit = false;
    }

    /**
     * Move to a new position.
     * 
     * If exit has been reached exit becomes true
     * 
     * @param {string} direction - direction to follow
     */
    move(direction) {
        const room = this.maze.rooms[this.row][this.column];
        // check for exit
        if (direction === 'left' && room['left'] === 'exit') {
            this.exit = true;
            return;
        } else if (direction === 'right' && room['right'] === 'exit') {
            this.exit = true;
            return;
        } else if (direction === 'up' && room['up'] === 'exit') {
            this.exit = true;
            return;
        } else if (direction === 'down' && room['down'] === 'exit') {
            this.exit = true;
            return;
        }

        // do move
        if (direction === 'left') {
            this.column = this.column - 1;
            if (this.column < 0) {
                this.column = 0;
            }
        } else if (direction === 'right') {
            this.column = this.column + 1;
            if (this.column >= this.maze.nbColumn) {
                this.column = this.maze.nbColumn - 1;
            }
        } else if (direction === 'up') {
            this.row = this.row - 1;
            if (this.row < 0) {
                this.row = 0;
            }
        } else if (direction === 'down') {
            this.row = this.row + 1;
            if (this.row >= this.maze.nbRow) {
                this.row = this.maze.nbRow - 1;
            }
        }
    }
}

/**
 * Bot result in maze.
 * 
 * @typedef {Object} RunResult
 * @property {'success'|'failure'} state - result of bot in maze
 * @property {number} steps - number of steps in maze
 */

 /**
 * Enum for wall type.
 * @readonly
 * @enum {string}
 */
const WallType = {
    /** maze entry */
    ENTRY: 'entry',
    /** maze exit */
    EXIT: 'exit',
    /** normal wall */
    WALL: 'wall',
    /** wall with door */
    DOOR: 'door'
};

/**
 * Room description.
 * @typedef {Object} Room
 * @property {WallType} left - left wall type
 * @property {WallType} right - right wall type
 * @property {WallType} up - up wall type
 * @property {WallType} down - down wall type
 */

/**
 * This function is called to get bot decision in a room.
 * 
 * @callback BotCallback
 * @param {Room} room
 * @return {Action} action to execute
 */

/**
 * Maze
 */
class Maze {
    /**
     * Create Maze.
     * 
     * @param {string[]} def 
     */
    constructor(def, logfilename) {
        this.mazeRawDefinition = def;
        this.entry = [0, 0, 'left'];
        this.exit = [0, 0, 'right'];
        this.nbRow = 0;
        this.nbColumn = 0;
        this.rooms = [];
        this.steps = 0;
        /** @type {'success'|'failure'} */
        this.state = 'failure';
        this.logfile = fs.createWriteStream(logfilename);

        this.botPosition = new Position(0, 0, this);

        this.loadFromStringArray(this.mazeRawDefinition);
    }
    
    /**
     * Build internal structure from array of string.
     * 
     * @param {string[]} def 
     * @private
     */
    /* istanbul ignore next */
    loadFromStringArray(def) {
        this.nbRow = (def.length - 1) / 2;
        this.nbColumn = (def[0].length - 1) / 2;

        for (let i = 0; i < this.nbRow; i++) {
            const row = [];
            for (let j = 0; j < this.nbColumn; j++) {
                const left = this.getInfo(def, i, j, 'left');
                const right = this.getInfo(def, i, j, 'right');
                const up = this.getInfo(def, i, j, 'up');
                const down = this.getInfo(def, i, j, 'down');
                row.push({ left, right, up, down, botSeen: false });

                if (left === 'entry') {
                    this.entry = [i, j, 'left'];
                } else if (right === 'entry') {
                    this.entry = [i, j, 'right'];
                } else if (up === 'entry') {
                    this.entry = [i, j, 'up'];
                } else if (down === 'entry') {
                    this.entry = [i, j, 'down'];
                }

                if (left === 'exit') {
                    this.exit = [i, j, 'left'];
                } else if (right === 'exit') {
                    this.exit = [i, j, 'right'];
                } else if (up === 'exit') {
                    this.exit = [i, j, 'up'];
                } else if (down === 'exit') {
                    this.exit = [i, j, 'down'];
                }
            }
            this.rooms.push(row);
        }
    }

    /**
     * Get type of wall in raw definition of maze.
     * 
     * @param {string[]} rawDefinition - maze definition 
     * @param {number} i - row index
     * @param {number} j - column index
     * @param {string} direction - direction to look at
     * @private
     */
    getInfo(rawDefinition, i, j, direction) {
        let char = ' ';
        if (direction === 'left') {
            char = rawDefinition[i*2+1][j*2];
        } else if (direction === 'right') {
            char = rawDefinition[i*2+1][j*2+2];
        } else if (direction === 'up') {
            char = rawDefinition[i*2][j*2+1];
        } else if (direction === 'down') {
            char = rawDefinition[i*2+2][j*2+1];
        }

        if (char === 'x') {
            return 'entry';
        } else if (char === 'X') {
            return 'exit';
        } else if (char === ' ') {
            return 'door';
        }

        return 'wall';
    }

    /**
     * Let bot run in maze.
     * 
     * @param {BotCallback} botCallback 
     */
    run(botCallback) {
        this.botPosition = new Position(this.entry[0], this.entry[1], this);
        this.showBot();

        const max_lopp = this.nbRow * this.nbColumn * 4;
        while (this.steps < max_lopp) {
            this.rooms[this.botPosition.row][this.botPosition.column].botSeen = true;
            const result = botCallback(this.rooms[this.botPosition.row][this.botPosition.column]);
            if (result.action === 'move') {
                this.botPosition.move(result.direction);
            }
            this.steps++;
            this.showBot();
            if (this.botPosition.exit) {
                this.state = 'success';
                break;
            }
        }

        this.logfile.end();
    }

    /**
     * Result of bot in maze.
     * 
     * @return {RunResult}
     */
    result() {
        return { steps: this.steps, state: this.state }; 
    }

    /**
     * Show bot in maze.
     * 
     * @private
     */
    /* istanbul ignore next */
    showBot() {
        this.logfile.write(`=== STEP ${this.steps} ====\n`);
        for (let i = 0; i < this.nbRow; i++) {
            let topLine = '';
            let line = '';
            for (let j = 0; j < this.nbColumn; j++) {
                topLine = topLine + '+';
                if (this.rooms[i][j].up === 'entry') {
                    topLine = topLine + 'x';
                } else if (this.rooms[i][j].up === 'exit') {
                    if (this.botPosition.exit) {
                        topLine = topLine + 'B';
                    } else {
                        topLine = topLine + 'X';
                    }
                } else if (this.rooms[i][j].up === 'door') {
                    topLine = topLine + ' ';
                } else {
                    topLine = topLine + '-';
                }

                if (this.rooms[i][j].left === 'entry') {
                    line = line + 'x';
                } else if (this.rooms[i][j].left === 'exit') {
                    if (this.botPosition.exit) {
                        line = line + 'B';
                    } else {
                        line = line + 'X';
                    }
                } else if (this.rooms[i][j].left === 'door') {
                    line = line + ' ';
                } else {
                    line = line + '|';
                }

                if (this.botPosition.row === i && this.botPosition.column === j) {
                    line = line + 'B';
                } else if (this.rooms[i][j].botSeen) {
                    line = line + 'b';
                } else {
                    line = line + ' ';
                }
            }
            topLine = topLine + '+\n';
            if (this.rooms[i][this.nbColumn-1].right === 'entry') {
                line = line + 'x';
            } else if (this.rooms[i][this.nbColumn-1].right === 'exit') {
                if (this.botPosition.exit) {
                    line = line + 'B';
                } else {
                    line = line + 'X';
                }
            } else if (this.rooms[i][this.nbColumn-1].right === 'door') {
                line = line + ' ';
            } else {
                line = line + '|';
            }
            line = line + '\n';
            // draw top of row
            this.logfile.write(topLine);
            // draw row
            this.logfile.write(line);
        }
        // draw last line
        let bottomLine = '';
        for (let j = 0; j < this.nbColumn; j++) {
            bottomLine = bottomLine + '+';
            if (this.rooms[this.nbRow-1][j].down === 'entry') {
                bottomLine = bottomLine + 'x';
            } else if (this.rooms[this.nbRow-1][j].down === 'exit') {
                if (this.botPosition.exit) {
                    bottomLine = bottomLine + 'b';
                } else {
                    bottomLine = bottomLine + 'X';
                }
            } else {
                bottomLine = bottomLine + '-';
            }
        }
        bottomLine = bottomLine + '+\n';
        this.logfile.write(bottomLine);
    }
}

module.exports = { Maze };