
/**
 * Maze
 */
 export default class Maze {
    /**
     * Create Maze.
     * 
     * @param {string[]} def 
     */
    constructor(def) {
        this.mazeRawDefinition = def;
        this.nbRow = 0;
        this.nbColumn = 0;
        this.rooms = [];
        this.entry = null;
        this.exit = null;

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
                row.push({ maze: this, row: i, column: j, left, right, up, down, content: this.getCellContent(def,i,j) });
            }
            this.rooms.push(row);
        }
    }

    getDefinition() {
        const mazeDef = [];
        for (let i = 0; i < this.nbRow; i++) {
            let topLine = '';
            let line = '';
            for (let j = 0; j < this.nbColumn; j++) {
                topLine = topLine + '+';
                if (this.rooms[i][j].up === 'entry') {
                    topLine = topLine + 'x';
                } else if (this.rooms[i][j].up === 'exit') {
                    topLine = topLine + 'X';
                } else if (this.rooms[i][j].up === 'door') {
                    topLine = topLine + ' ';
                } else {
                    topLine = topLine + '-';
                }

                if (this.rooms[i][j].left === 'entry') {
                    line = line + 'x';
                } else if (this.rooms[i][j].left === 'exit') {
                    line = line + 'X';
                } else if (this.rooms[i][j].left === 'door') {
                    line = line + ' ';
                } else {
                    line = line + '|';
                }

                line = line + ' ';
            }
            topLine = topLine + '+';
            mazeDef.push(topLine);
            
            if (this.rooms[i][this.nbColumn-1].right === 'entry') {
                line = line + 'x';
            } else if (this.rooms[i][this.nbColumn-1].right === 'exit') {
                line = line + 'X';
            } else if (this.rooms[i][this.nbColumn-1].right === 'door') {
                line = line + ' ';
            } else {
                line = line + '|';
            }
            mazeDef.push(line);
        }
        // draw last line
        let bottomLine = '';
        for (let j = 0; j < this.nbColumn; j++) {
            bottomLine = bottomLine + '+';
            if (this.rooms[this.nbRow-1][j].down === 'entry') {
                bottomLine = bottomLine + 'x';
            } else if (this.rooms[this.nbRow-1][j].down === 'exit') {
                bottomLine = bottomLine + 'X';
            } else {
                bottomLine = bottomLine + '-';
            }
        }
        bottomLine = bottomLine + '+';
        mazeDef.push(bottomLine);

        return mazeDef;
    }

    getCell(i, j) {
        if (i >= 0 && j >= 0 && i < this.nbRow && j < this.nbColumn) {
            return this.rooms[i][j];
        }

        return null;
    }

    getLeftCell(i, j) {
        return this.getCell(i, j - 1);
    }

    getRightCell(i, j) {
        return this.getCell(i, j + 1);
    }

    getUpCell(i, j) {
        return this.getCell(i - 1, j);
    }

    getDownCell(i, j) {
        return this.getCell(i + 1, j);
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
            this.entry = {i,j};
            return 'entry';
        } else if (char === 'X') {
            this.exit = {i,j};
            return 'exit';
        } else if (char === ' ') {
            return 'door';
        } else if (char === 'B') {
            this.exit = {i,j};
            return 'botAtExit';
        }

        return 'wall';
    }

    getCellContent(rawDefinition, i, j) {
        const char = rawDefinition[i*2+1][j*2+1];
        if (char === 'b') {
            return 'b';
        } else if (char === 'B') {
            return 'B';
        } else {
            return '';
        }
    }
};
