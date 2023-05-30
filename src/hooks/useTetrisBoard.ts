import { useReducer, Dispatch } from 'react';
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES } from '../types';

export type BoardState = {
  board: BoardShape;
  droppingRow: number;
  droppingColumn: number;
  droppingBlock: Block;
  droppingShape: BlockShape;
}

export function useTetrisBoard(): [BoardState, Dispatch<Action>]{
  const [boardState, dispatchBoardState] = useReducer(boardReducer, {
    board: [],
    droppingRow: 0,
    droppingColumn: 0,
    droppingBlock: Block.I,
    droppingShape: SHAPES.I.shape,

  }, (emptyState) => {
    const state = {...emptyState, board: getEmptyBoard()}
    return state
  })
  return [boardState, dispatchBoardState]
}

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20

export function getEmptyBoard(height= BOARD_HEIGHT): BoardShape{
  return Array(height)
  .fill(null)
  .map(() => Array(BOARD_WIDTH).fill(EmptyCell.Empty));
}

export function hasCollisions(  
    board: BoardShape,
    currentShape: BlockShape,
    row: number,
    column: number
  ): boolean {
  let hasCollision = false
  currentShape
  .filter((shapeRow) => shapeRow.some((isSet) => isSet))
  .forEach((shapeRow: boolean[], rowIndex: number) => {
    shapeRow.forEach((isSet: boolean, colIndex: number) => {
      if (
        isSet &&
        (row + rowIndex >= board.length ||
          column + colIndex >= board[0].length ||
          column + colIndex < 0 ||
          board[row + rowIndex][column + colIndex] !== EmptyCell.Empty)
      ) {
        hasCollision = true;
      }
    });
  });
  return hasCollision
}

export function getRandomBlock(): Block {
  const blockValues = Object.values(Block);
  return blockValues[Math.floor(Math.random() * blockValues.length)] as Block;
}

type Action = {
  type: 'start' | 'drop' | 'commit' | 'move';
  newBoard?: BoardShape;
  newBlock? : Block;
}

function boardReducer(state: BoardState, action: Action): BoardState {
  let newState = {...state}
  switch(action.type){
    case 'start':
      const firstBlock= getRandomBlock()
      return {
        board: getEmptyBoard(),
        droppingRow: 0,
        droppingColumn: 3,
        droppingBlock: firstBlock,
        droppingShape: SHAPES[firstBlock].shape
      }
    case 'drop':
      newState.droppingRow++;
      break;
    case 'commit':
      return {
        board: action.newBoard,
        droppingRow: 0,
        droppingColumn: 3,
        droppingBlock: state.droppingBlock,
        droppingShape: state.droppingShape
      }
    case 'move':
    default:
      const unhandledType: any = action.type;
      throw new Error(`Unhandled action type: ${unhandledType}`)
  }
}