
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
                row.push({ left, right, up, down, content: this.getCellContent(def,i,j) });
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
        } else if (char === 'B') {
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
