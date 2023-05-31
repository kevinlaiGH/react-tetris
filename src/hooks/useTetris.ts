import { useCallback, useState, useEffect, KeyboardEvent } from 'react';
import { useInterval } from './useInterval';
import { Block, BlockShape, BoardShape, EmptyCell} from '../types';
import { BOARD_HEIGHT, getRandomBlock, hasCollisions, useTetrisBoard } from "./useTetrisBoard";

enum TickSpeed {
  Normal= 800,
  Sliding = 100,
  Fast = 50
}

export function useTetris(){
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [upcomingBlocks, setUpcomingBlocks] = useState<Block[]>([]);

  const [
    {board, droppingRow, droppingColumn, droppingBlock, droppingShape}
    , dispatchBoardState
  ] = useTetrisBoard();

  const commitPosition = useCallback(() => {
    if (!hasCollisions(board, droppingShape, droppingRow+ 1, droppingColumn )){
      setIsCommitting(false);
      setTickSpeed(TickSpeed.Normal);
      return;
    }

    const newBoard = structuredClone(board) as BoardShape
    addShapeToBoard(newBoard, droppingBlock, droppingShape, droppingRow, droppingColumn)

    let numCleared = 0
    for (let row= BOARD_HEIGHT - 1; row >= 0; row--){
      if(newBoard[row].every((entry) => entry !== EmptyCell.Empty)){
        numCleared++;
        newBoard.splice(row, 1);
      }
    }

    const newUpcomingBlocks = structuredClone(upcomingBlocks) as Block[]
    const newBlock = newUpcomingBlocks.pop()
    newUpcomingBlocks.unshift(getRandomBlock())
    setScore((prevScore) => prevScore + getPoints(numCleared))
    setTickSpeed(TickSpeed.Normal)
    setUpcomingBlocks(newUpcomingBlocks)
    dispatchBoardState({type: 'commit', newBoard, newBlock})
    setIsCommitting(false)
  }, [board, dispatchBoardState, droppingBlock, droppingColumn, droppingRow, droppingShape])

  const gameTick = useCallback(() => {
    if (isCommitting) {
      commitPosition();
    } else if (
      hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)
    ) {
      setTickSpeed(TickSpeed.Sliding);
      setIsCommitting(true);
    } else {
      dispatchBoardState({ type: 'drop' });
    }
  }, [
    board,
    commitPosition,
    dispatchBoardState,
    droppingColumn,
    droppingRow,
    droppingShape,
    isCommitting,
  ]);

  const startGame =useCallback(()=> {
    const startingBlocks = [
      getRandomBlock(),
      getRandomBlock(),
      getRandomBlock()
    ]
    setUpcomingBlocks(startingBlocks)
    setScore(0);
    setIsPlaying(true);
    setTickSpeed(TickSpeed.Normal),
    dispatchBoardState({type: 'start'})
  }, [dispatchBoardState])

  useInterval(() => {
    if (!isPlaying){
      return
    }
    gameTick();
  }, tickSpeed)

  useEffect(() => {
    if(!isPlaying){
      return
    }
    let isPressingLeft = false;
    let isPressingRight = false;
    let moveIntervalID: number | undefined;

    const updateMovementInterval = () => {
      clearInterval(moveIntervalID);
      dispatchBoardState({
        type: 'move',
        isPressingLeft,
        isPressingRight,
      });
      moveIntervalID = setInterval(() => {
        dispatchBoardState({
          type: 'move',
          isPressingLeft,
          isPressingRight,
        });
      }, 300);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if(event.repeat){
        return;
      }
      if (event.key === 'ArrowDown'){
        setTickSpeed(TickSpeed.Fast)
      }
      if (event.key === "ArrowUp"){
        dispatchBoardState({
          type: 'move',
          isRotating: true
        })
      }
      if (event.key === "ArrowLeft"){
        isPressingLeft = true;
        updateMovementInterval();
      }
      if (event.key === "ArrowRight"){
        isPressingRight = true;
        updateMovementInterval();
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPlaying])

  const renderedBoard = structuredClone(board) as BoardShape
  if (isPlaying){
    droppingShape
      .filter((row) => row.some((isSet) => isSet))
      .forEach((row: boolean[], rowIndex: number) => {
        row.forEach((isSet: boolean, colIndex: number) => {
          if (isSet){
            renderedBoard[droppingRow + rowIndex][droppingColumn + colIndex] = droppingBlock
          }
        })
      })
  }
  return {
    board: renderedBoard,
    startGame,
    isPlaying
  }
}

function addShapeToBoard(
  board: BoardShape,
  droppingBlock: Block,
  droppingShape: BlockShape,
  droppingRow: number,
  droppingColumn: number
) {
  droppingShape
    .filter((row) => row.some((isSet) => isSet))
    .forEach((row: boolean[], rowIndex: number) => {
      row.forEach((isSet: boolean, colIndex: number) => {
        if (isSet) {
          board[droppingRow + rowIndex][droppingColumn + colIndex] =
            droppingBlock;
        }
      });
    });
}

function getPoints(numCleared: number): number{
  switch(numCleared){
    case 0:
      return 0;
    case 1:
      return 100;
    case 2:
      return 300;
    case 3:
      return 500;
    case 4:
      return 800;
    default:
      throw new Error("Unexpected number of rows cleared")
  }
}