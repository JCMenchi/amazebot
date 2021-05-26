import React, { useState, useEffect } from 'react';

import Maze from './maze'
import MazeCell from './MazeCell';

/**
 * Maze viewer
 * 
 */
export default function MazeViewer({ maze, cellWidth, cellHeight, cellMargin, width, height, readonly }) {

    const [mazeDef, setMazeDef] = useState([]);

    const worldWidth = maze?(maze.nbColumn * (cellWidth + 2 * cellMargin) + 2 * cellMargin):300;
    const worldHeight = maze?(maze.nbRow * (cellHeight + 2 * cellMargin) + 2 * cellMargin):300;
    const reload = () => {
        const newdef = maze.getDefinition();
        setMazeDef(newdef);
    }

    return (
        <svg width={width} height={height} viewBox={`0 0 ${worldWidth} ${worldHeight}`}>
            {maze &&
                <rect x="0" y="0" width={maze.nbColumn * (cellWidth + 2 * cellMargin) + 2 * cellMargin}
                    height={maze.nbRow * (cellHeight + 2 * cellMargin) + 2 * cellMargin} style={{ stroke: "none", fill: "#AAA" }} />
            }
            <g id="maze">
                {maze &&
                    [...Array(maze.nbRow).keys()].map((i) => (
                        [...Array(maze.nbColumn).keys()].map((j) => (
                            <MazeCell key={i*maze.nbColumn+j}
                                xorigin={2 * cellMargin + j * (cellWidth + 2 * cellMargin)}
                                yorigin={2 * cellMargin + i * (cellHeight + 2 * cellMargin)}
                                width={cellWidth}
                                height={cellHeight} 
                                margin={cellMargin}
                                mazeDef={mazeDef}
                                reload={reload}
                                readonly={readonly}
                                room={maze.rooms[i][j]} />
                        ))
                    ))
                }
            </g>
        </svg>
    );
}
