import React, {useState} from 'react';

const WALL_TYPE_WALL = 'wall';
const WALL_TYPE_DOOR = 'door';
const WALL_TYPE_EXIT = 'exit';
const WALL_TYPE_ENTRY = 'entry';

function cellPath(cell, xo, yo, w, h, m) {
    const w3 = w / 3.0;
    const h3 = h / 3.0;
    // start top left corner
    let path = `M${xo} ${yo}`
    // follow top to right corner
    if (cell.up === WALL_TYPE_WALL) {
        path = path + ` h ${w}`;
    } else {
        path = path + ` h ${w3} v -${m*1.5} m ${w3} 0 v ${m*1.5} h ${w3}`;
    }
    // go down
    if (cell.right === WALL_TYPE_WALL) {
        path = path + ` v ${h}`;
    } else {
        path = path + ` v ${h3} h ${m*1.5} m 0 ${h3} h -${m*1.5} v ${h3}`;
    }
    // follow bottom to left
    if (cell.down === WALL_TYPE_WALL) {
        path = path + ` h -${w}`;
    } else {
        path = path + ` h -${w3} v ${m*1.5} m -${w3} 0 v -${m*1.5} h -${w3}`;
    }
    // go back to top left corner
    if (cell.left === WALL_TYPE_WALL) {
        path = path + ` v -${h}`;
    } else {
        path = path + ` v -${h3} h -${m*1.5} m 0 -${h3} h ${m*1.5} v -${h3}`;
    }

    return path;
}

/**
 * Maze cell
 * 
 */
export default function MazeCell({readonly, reload, xorigin, yorigin, width, height, margin, room}) {


    const [selected, setSelected] = useState(false);

    const handleClick = (event) => {
        if (!readonly) {
            setSelected(!selected);
        }
    }

    const closeUpWall = () => {
        if (readonly) {
            return;
        }
        const upcell = room.maze.getUpCell(room.row, room.column);
        if (upcell) {
            room.up = WALL_TYPE_WALL;
            upcell.down = WALL_TYPE_WALL
        } else {
            if (room.up === WALL_TYPE_ENTRY) {
                room.up = WALL_TYPE_EXIT;
            } else {
                room.up = WALL_TYPE_WALL;
            }
        }
        reload();
    }

    const openUpWall = () => {
        if (readonly) {
            return;
        }
        const upcell = room.maze.getUpCell(room.row, room.column);
        if (upcell) {
            room.up = WALL_TYPE_DOOR;
            upcell.down = WALL_TYPE_DOOR
        } else {
            room.up = WALL_TYPE_ENTRY;
        }
        reload();
    }

    const closeDownWall = () => {
        if (readonly) {
            return;
        }
        const downcell = room.maze.getDownCell(room.row, room.column);
        if (downcell) {
            room.down = WALL_TYPE_WALL;
            downcell.up = WALL_TYPE_WALL
        } else {
            if (room.down === WALL_TYPE_ENTRY) {
                room.down = WALL_TYPE_EXIT;
            } else {
                room.down = WALL_TYPE_WALL;
            }
        }
        reload();
    }

    const openDownWall = () => {
        if (readonly) {
            return;
        }
        const downcell = room.maze.getDownCell(room.row, room.column);
        if (downcell) {
            room.down = WALL_TYPE_DOOR;
            downcell.up = WALL_TYPE_DOOR
        } else {
            room.down = WALL_TYPE_ENTRY;
        }
        reload();
    }

    const closeLeftWall = () => {
        if (readonly) {
            return;
        }
        const leftcell = room.maze.getLeftCell(room.row, room.column);
        if (leftcell) {
            room.left = WALL_TYPE_WALL;
            leftcell.right = WALL_TYPE_WALL
        } else {
            if (room.left === WALL_TYPE_ENTRY) {
                room.left = WALL_TYPE_EXIT;
            } else {
                room.left = WALL_TYPE_WALL;
            }
        }
        reload();
    }

    const openLeftWall = () => {
        if (readonly) {
            return;
        }
        const leftcell = room.maze.getLeftCell(room.row, room.column);
        if (leftcell) {
            room.left = WALL_TYPE_DOOR;
            leftcell.right = WALL_TYPE_DOOR
        } else {
            room.left = WALL_TYPE_ENTRY;
        }
        reload();
    }

    const closeRightWall = () => {
        if (readonly) {
            return;
        }
        const rightcell = room.maze.getRightCell(room.row, room.column);
        if (rightcell) {
            room.right = WALL_TYPE_WALL;
            rightcell.left = WALL_TYPE_WALL
        } else {
            if (room.right === WALL_TYPE_ENTRY) {
                room.right = WALL_TYPE_EXIT;
            } else {
                room.right = WALL_TYPE_WALL;
            }
        }
        reload();
    }

    const openRightWall = () => {
        if (readonly) {
            return;
        }
        const rightcell = room.maze.getRightCell(room.row, room.column);
        if (rightcell) {
            room.right = WALL_TYPE_DOOR;
            rightcell.left = WALL_TYPE_DOOR
        } else {
            room.right = WALL_TYPE_ENTRY;
        }
        reload();
    }

    return (
        <g className="cell">
            <rect x={xorigin} y={yorigin} width={width} height={height} 
                  style={{stroke:"grey", fill:"grey"}}
                  onClick={(event) => handleClick(event)} />
            
            { room.up !== 'wall' && 
                <rect x={xorigin + width/3.0} 
                      y={yorigin - margin}
                      width={width/3.0}
                      height={margin*1.5}
                      style={{stroke:"none", fill:"grey"}}
                      onClick={(event) => closeUpWall(event)}
                      />
            }

            { room.up === 'wall' && 
                <rect x={xorigin} 
                      y={yorigin - margin}
                      width={width}
                      height={margin*1.5}
                      style={{stroke:"none", fill:"grey", fillOpacity: 0}}
                      onClick={(event) => openUpWall(event)}
                      />
            }


            { room.down !== 'wall' && 
                <rect x={xorigin + width/3.0} 
                      y={yorigin + height}
                      width={width/3.0}
                      height={margin*1.5}
                      style={{stroke:"none", fill:"grey"}}
                      onClick={(event) => closeDownWall(event)}
                      />
            }

            { room.down === 'wall' && 
                <rect x={xorigin} 
                      y={yorigin + height}
                      width={width}
                      height={margin*1.5}
                      style={{stroke:"none", fill:"grey", fillOpacity: 0}}
                      onClick={(event) => openDownWall(event)}
                      />
            }

            { room.right !== 'wall' && 
                <rect x={xorigin + width} 
                      y={yorigin + height/3.0}
                      width={margin*1.5}
                      height={height/3.0}
                      style={{stroke:"none", fill:"grey"}}
                      onClick={(event) => closeRightWall(event)}
                      />
            }

            { room.right === 'wall' && 
                <rect x={xorigin + width} 
                      y={yorigin}
                      width={margin*2}
                      height={height}
                      style={{stroke:"none", fill:"grey", fillOpacity: 0}}
                      onClick={(event) => openRightWall(event)}
                      />
            }

            { room.left !== 'wall' && 
                <rect x={xorigin - 1.5*margin } 
                      y={yorigin + height/3.0}
                      width={margin*1.5}
                      height={height/3.0}
                      style={{stroke:"none", fill:"grey"}}
                      onClick={(event) => closeLeftWall(event)}
                      />
            }

            { room.left === 'wall' && 
                <rect x={xorigin - 1.5*margin } 
                      y={yorigin + height/3.0}
                      width={margin*1.5}
                      height={height/3.0}
                      style={{stroke:"none", fill:"grey", fillOpacity: 0}}
                      onClick={(event) => openLeftWall(event)}
                      />
            }

            { room.up === 'entry' && 
                <path d={`M ${xorigin+width/2.0} ${yorigin} l -${width*0.1} -${margin*2} h ${width*0.2} Z`}
                      style={{stroke:"none", fill:"green"}} onClick={(event) => closeUpWall(event)}
                      />
            }

            { room.up === 'exit' && 
                <path d={`M ${xorigin+width/2.0} ${yorigin-margin*2} l -${width*0.1} ${margin*2} h ${width*0.2} Z`}
                      style={{stroke:"none", fill:"green"}} onClick={(event) => closeUpWall(event)}
                      />
            }

            { room.up === 'botAtExit' && 
                <path d={`M ${xorigin+width/2.0} ${yorigin-margin*2} l -${width*0.1} ${margin*2} h ${width*0.2} Z`}
                      style={{stroke:"none", fill:"blue"}} onClick={(event) => closeUpWall(event)}
                      />
            }

            { room.down === 'entry' && 
                <path d={`M ${xorigin+width/2.0} ${yorigin+height} l -${width*0.1} ${margin*2} h ${width*0.2} Z`}
                      style={{stroke:"none", fill:"green"}} onClick={(event) => closeDownWall(event)}
                      />
            }

            { room.down === 'exit' && 
                <path d={`M ${xorigin+width/2.0} ${yorigin+height+margin*2} l -${width*0.1} -${margin*2} h ${width*0.2} Z`}
                      style={{stroke:"none", fill:"green"}} onClick={(event) => closeDownWall(event)}
                      />
            }

            { room.botAtExit === 'exit' && 
                <path d={`M ${xorigin+width/2.0} ${yorigin+height+margin*2} l -${width*0.1} -${margin*2} h ${width*0.2} Z`}
                      style={{stroke:"none", fill:"blue"}} onClick={(event) => closeDownWall(event)}
                      />
            }

            { room.left === 'entry' && 
                <path d={`M ${xorigin} ${yorigin+height/2.0} l -${margin*2} -${height*0.1} v ${height*0.2} Z`}
                      style={{stroke:"none", fill:"green"}} onClick={(event) => closeLeftWall(event)}
                      />
            }

            { room.left === 'exit' && 
                <path d={`M ${xorigin-2*margin} ${yorigin+height/2.0} l ${margin*2} -${height*0.1} v ${height*0.2} Z`}
                      style={{stroke:"none", fill:"green"}} onClick={(event) => closeLeftWall(event)}
                      />
            }

            { room.left === 'botAtExit' && 
                <path d={`M ${xorigin-2*margin} ${yorigin+height/2.0} l ${margin*2} -${height*0.1} v ${height*0.2} Z`}
                      style={{stroke:"none", fill:"blue"}} onClick={(event) => closeLeftWall(event)}
                      />
            }

            { room.right === 'entry' && 
                <path d={`M ${xorigin+width} ${yorigin+height/2.0} l ${margin*2} -${height*0.1} v ${height*0.2} Z`}
                      style={{stroke:"none", fill:"green"}} onClick={(event) => closeRightWall(event)}
                      />
            }

            { room.right === 'exit' && 
                <path d={`M ${xorigin+width+2*margin} ${yorigin+height/2.0} l -${margin*2} -${height*0.1} v ${height*0.2} Z`}
                      style={{stroke:"none", fill:"green"}} onClick={(event) => closeRightWall(event)}
                      />
            }

            { room.right === 'botAtExit' && 
                <path d={`M ${xorigin+width+2*margin} ${yorigin+height/2.0} l -${margin*2} -${height*0.1} v ${height*0.2} Z`}
                      style={{stroke:"none", fill:"blue"}}
                      />
            }

            <path d={cellPath(room, xorigin, yorigin, width, height, margin)} 
                    style={{stroke:"blue", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth:2, fill:"none"}}/>

            { room.content !== '' && 
                <circle cx={xorigin + width/2 } cy={ yorigin + height/2 } r={width/4} 
                style={{stroke:"none", fill:"blue"}} 
                onClick={(event) => handleClick(event)} />
            }

            { selected && 
                <circle cx={xorigin + width/2 } cy={ yorigin + height/2 } r={width/8} 
                        style={{stroke:"none", fill:"green"}} 
                        onClick={(event) => handleClick(event)} /> 
            }
        </g>
    );
}
