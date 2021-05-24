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
export default function MazeCell({xorigin, yorigin, width, height, margin, room}) {


    const [selected, setSelected] = useState(false);

    const handleClick = (event) => {
        setSelected(!selected);
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
                      />
            }

            { room.down !== 'wall' && 
                <rect x={xorigin + width/3.0} 
                      y={yorigin + height}
                      width={width/3.0}
                      height={margin*1.5}
                      style={{stroke:"none", fill:"grey"}}
                      />
            }

            { room.right !== 'wall' && 
                <rect x={xorigin + width} 
                      y={yorigin + height/3.0}
                      width={margin*1.5}
                      height={height/3.0}
                      style={{stroke:"none", fill:"grey"}}
                      />
            }

            { room.left !== 'wall' && 
                <rect x={xorigin - 1.5*margin } 
                      y={yorigin + height/3.0}
                      width={margin*1.5}
                      height={height/3.0}
                      style={{stroke:"none", fill:"grey"}}
                      />
            }

            { room.left === 'entry' && 
                <path d={`M ${xorigin} ${yorigin+height/2.0} l -${margin*2} -${height*0.1} v ${height*0.2} Z`}
                      style={{stroke:"none", fill:"green"}}
                      />
            }

            { room.right === 'exit' && 
                <path d={`M ${xorigin+width+2*margin} ${yorigin+height/2.0} l -${margin*2} -${height*0.1} v ${height*0.2} Z`}
                      style={{stroke:"none", fill:"green"}}
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
