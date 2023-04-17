import React, {memo, useEffect, useRef} from 'react';
import {ActiveBoard} from "./activeBoard";


const Board = () => {

    //activeBoard returns three params 
    const [dis, score, onKeyDown] = ActiveBoard();
    //useRef() for uncontrolled component - allow parent to manipulate component
    const eBoard = useRef();

    //empty array keeps board from rendering more than once 
    useEffect(currBoard, []);

    //create current board
    function currBoard() {
        eBoard.current.focus();
    }

    return (

        //renders scoreboard label & value and renders game board 
        <div ref={eBoard} className={'t-board'} tabIndex={0} onKeyDown={onKeyDown}>
            <div>
                <span className='t-score-label'>Score:</span>
                <span className='t-score-label'>{score.toLocaleString()}</span>
            </div>
            <div> --- </div>
            {dis.map((row, index) => <Row row={row} key={index}/>)}
        </div>
    );
};

/**
 * Create row via passing in props to map cell/index values
 */
const Row = memo(props => {
    return (
        <span className ='t-row'>
            {props.row.map((cell, index) => <Cell cell={cell} key={index}/>)}
        </span>
    );
});

/**
 * Create cells via uncontrolled component generating individual cells to populate row 
 */

const Cell = memo( props => {
    const count = useRef(0);
    count.current++;
    const val = props.cell ? props.cell : 0;
    return (
        <span className={`t-cell t-cell-${val}`}></span>
    );
});

export default memo(Board);