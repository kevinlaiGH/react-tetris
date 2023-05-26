import { BoardShape } from "../types";
import Cell from "./Cell";

interface Props {
  currentBoard: BoardShape;
}

function Board({ currentBoard }: Props) {
  return (
    <div className="board">
      {currentBoard.map((row, rowIndex) => (
        <div className="row" key={`${rowIndex}`}>
          {row.map((cell, colIndex) => (
            <Cell key={`${rowIndex}-${colIndex}`} type={cell} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;

/* 
Map over our current board props and 
Create a new row for each row in the board (give each row a unique key)
Within each row, we can create a cell for each value
Create a new component cell to take in the type of cell (cell options we created earlier in types.tsx)
*/
