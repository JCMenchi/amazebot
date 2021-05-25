import React, { useState, useEffect } from 'react';

import Maze from './maze'
import MazeCell from './MazeCell';

/**
 * Maze viewer
 * 
 */
export default function MazeViewer({ mazedef, cellWidth, cellHeight, cellMargin }) {

    const [maze, setMaze] = useState({nbColumn: 0, nbRow: 0});

    // The useEffect() hook fires any time that the component is rendered.
    // An empty array is passed as the second argument so that the effect only fires once.
    useEffect(() => {
        const m = new Maze(mazedef);
        setMaze(m);
    }, [mazedef]);

    const reload = () => {
        mazedef = maze.getDefinition();
        const m = new Maze(mazedef);
        setMaze(m);
    }

    return (
        <svg viewBox={`0 0 ${maze.nbColumn * (cellWidth + 2 * cellMargin) + 2 * cellMargin} ${maze.nbRow * (cellHeight + 2 * cellMargin) + 2 * cellMargin}`}>
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
                                reload={reload}
                                room={maze.rooms[i][j]} />
                        ))
                    ))
                }
            </g>
        </svg>
    );
}
