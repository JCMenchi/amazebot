import React, { useState, useEffect } from 'react';

import Maze from './maze'
import MazeCell from './MazeCell';

/**
 * Maze viewer
 * 
 */
export default function MazeViewer({ maze, cellWidth, cellHeight, cellMargin, readonly }) {

    const [mazeDef, setMazeDef] = useState([]);

    const width = maze?(maze.nbColumn * (cellWidth + 2 * cellMargin) + 2 * cellMargin):300;
    const height = maze?(maze.nbRow * (cellHeight + 2 * cellMargin) + 2 * cellMargin):300;
    const reload = () => {
        const newdef = maze.getDefinition();
        setMazeDef(newdef);
    }

    return (
        <svg viewBox={`0 0 ${width} ${height}`}>
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
