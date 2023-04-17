/**
 * Board model for gameplay instance - 
 * useState holds all current state information for proper game model rendering
 */


import React, {useState, useEffect} from 'react';
import {useInterval} from './useInterval';
import { generateShape } from './shapes';

// # Rows & Columns
export const ROW_CT = 20;
export const COL_CT = 10;

/**
 * 
 * Create scene via mapping over rows.
 */
function copyScene(scene) {
    return scene.map(row => row.slice());
}

/**
 * Merges scene + shape into "stage" component.
 * Evaluates if shape pos is valid & then calls updateStage function to render the updated stage (scene + shape)
 */
function mergeIntoStage(stage, shape, pos) {
    let staged = stage;

    shape.shape.forEach( p => {
        const x = p.x + pos.x;
        const y = p.y + pos.y;

        if ( x < 0 || y < 0 || 
            x >= COL_CT || y >= ROW_CT) {
            return;
        }

        staged = updateStage(staged, x, y, 1);
    
    });

    return staged;
}


/**
 * Renders stage with each turn 
 */
function updateStage(stage, x, y, val) {
    
    //if location of x & y are the current value, return unchanged stage
    if (stage[y][x] === val) {
        return stage;
    }

    //set variable to slice stage
    const staged = stage.slice();
    //slice individual y value 
    staged[y] = stage[y].slice();
    //set x and y sliced values as value
    staged[y][x] = val;
    //return updated stage
    return staged;

}


/**
 * Generates new scene for gameplay via returning a 2D array with row & column dimensions
 */
function generateNewScene() {
    return Array.from(Array(ROW_CT), () => Array(COL_CT).fill(0));
}

/**
 * React useState & useEffect logic that allows for manipulation of in-game components. 
 * Creates current state information for proper game rendering
 */
export function ActiveBoard() {

    //initial state set by generating new scene
    const [scene, setScene] = useState(() => generateNewScene());
    //initial state set by generating new shape
    const [shape, setShape] = useState(() => generateShape());
     //initial state set at [0,0]
    const [pos, setPos] = useState({x: 0, y:0});
    //initial display created when scene & shape are merged into stage object
    const [dis, setDis] = useState( () => mergeIntoStage(scene, shape, pos));
    //initial player score set to 0
    const [score, setScore] = useState(0);

    //after render component needs to call update display and pass [scene, shape, pos]
    useEffect(updateDisplay, [scene, shape, pos]);
    //after render component needs to call removeWonLines and pass in current scene to properly remove and render screen
    useEffect(removeWonLines, [scene]);

    /**
     *  Uncontrolled component wrapped in jsx hook. Takes in 'beat' and time interval. 
     *      if keyboard event ('beat'), the shape will move down/rotate depending upon keystroke
     *          successful if new pos fits in scene.
     *      if time interval, the shape is moved downward
     *          if shape doesn't fit, move is cancelled. 
     *          shape is merged into the scene.
     *          a ne
     * w shape is generated at the top of the 'stage'.
     */
    useInterval(beat, 500);


    
    //sets display
    function updateDisplay() {
        const newDis = mergeIntoStage(scene, shape, pos);
        setDis(newDis);

    }

    /**
     * 'beat' updates model, triggered by keystroke
     */
    function beat() {
        if (!movePos(0, 1)) {
            placeShape();
        }
    }

    /**
     * Place shape in updated position & reset position to 0,0
     */
    function placeShape() {
        setScene(mergeIntoStage(scene, shape, pos));
        setShape(generateShape);
        setPos({x: 0, y: 0});
    }

    /**
     * Rotates shape by calculating new points for rotated shape. 
     *  a new shape is then generated using calculated points for rotation.
     */
    function rotateShape() {
        const tX = Math.floor(shape.width / 2);
        const tY
         = Math.floor(shape.height / 2);

        const newPt = shape.shape.map( p => {
            let {x, y} = p;
            x -= tX;
            y -= tY;

            let rX = -y;
            let rY = x;

            rX += tX;
            rY += tY;
            return {x: rX, y: rY};
        });
        
        //newShape takes in new points, after rotation, + shapes width/height
        const newShape = {
            shape: newPt,
            width: shape.width,
            height: shape.height
        };

        //if the pos of the new shape is considered valid (fitting w/in scene), set newShape with newShape value
        if (validPos(pos, newShape)) {
            setShape(newShape);
        }
    }

    /**
     * removeWonLines generates new scene with previous scene's completed ("won") line removed  
     */
    function removeWonLines() {
        const newScene = copyScene(scene);
        let touched = false;
        //"row" (y-value) to be removed is passed in
        const removeRow = (rY) => {
            //outter-loop sets y as row-value, if greater than 0, it decrements 
            for (let y = rY; y > 0; y--) {
                //inner-loop sets y as 0, if less than the # of columns - 1, it increments
                for (let x = 0; x < COL_CT - 1; x++) {
                    //new scene with the updated row count (y-1) and x.
                    newScene[y][x] = newScene[y-1][x];
                }
            }
            //once row is deleted, new blank row needs to be generated at the top
            for (let x = 0; x < COL_CT - 1; x++) {
                newScene[0][x] = 0;
            }
            
            //touched set to true to indiciate line was removed and new one generated
            touched = true;

            //set user score by adding 100pts for line removal
            setScore( scored => scored + 100 );
        };

        //outter-loop if y is less than row count, increment
        for (let y = 0; y < ROW_CT; y++) {
            //scene has no empties, indicate w/ false boolean value
            let rowHasEmpty = false;
            //inner-loop if x is less than column count, increment
            for (let x = 0; x < COL_CT - 1; x++) {
            

                //if scenes y and x values = 0, set empty row to true and break
                if (newScene[y][x] === 0) {
                    rowHasEmpty = true;
         
                    break;
                }
            }
            if(!rowHasEmpty) {
                removeRow(y);
            }
        }

        //if touched is true - setScene with a newScene 
        if (touched) {

            setScene(newScene);
        }
    }

    /**
     * Switch case for keystrokes & subsequent position movment update values
     */
    function onKeyDown(e) {
        switch (e.key) {
            //arrow up case calls for shape to be rotated
            case 'ArrowUp':
                rotateShape();
                e.preventDefault();
                break;
            //arrow right moves 1 val right on x-axis, 0 val on y-axis    
            case 'ArrowRight':
                movePos(1,0);
                e.preventDefault();
                break;
            //arrow right moves 1 val down on y-axis, 0 val of x-axis    
            case 'ArrowDown':
                movePos(0,1);
                e.preventDefault();
                break;
            //arrow left moves 1 val left (-1) on x-axis, 0 val on y-axis   
            case 'ArrowLeft':
                movePos(-1,0);
                e.preventDefault();
                break;
            default:
                break;            
        }
    }

    /**
     * Move position function takes in x and y values, if position is correct, setPosition is assigned updated value pair & 
     *      function returns true. If invalid, returns false
     */
    function movePos(x, y) {
        //set constant with updated x, y value pair
        const moved = {
            x: x + pos.x, 
            y: y + pos.y
        };
        //if invalid position, return false
        if (!validPos(moved, shape)) {
            return false;
        }
        //if valid position, set position to new position and return true
        setPos(moved);
        return true;
    }

    /**
     * Take in position and shape & check points against position. If valid, return as true position. 
     *      If invalid, return as false position
     */
    function validPos(pos, shape) {
        return shape.shape.every( p => {
            const tX = p.x + pos.x;
            const tY = p.y + pos.y;
            
            //if val of x is less than 0 or greater than or equal to columns, return false
            if (tX < 0 || tX >= COL_CT) {
                return false;
            }
            //if val of y is less than 0 or greater than or equal to rows, return false
            if (tY < 0 || tY >= ROW_CT) {
                return false;
            }
            if (scene[tY][tX]!== 0) {
                return false;
            }

            return true;
        });
    }

    return [dis, score, onKeyDown];
}
export default ActiveBoard;

