import { useCallback, useState, useEffect, KeyboardEvent } from 'react';
import { useInterval } from './useInterval';
import { Block, BlockShape, BoardShape} from '../types';
import { getRandomBlock, hasCollisions, useTetrisBoard } from "./useTetrisBoard";

enum TickSpeed {
  Normal= 800,
  Sliding = 100,
  Fast = 50
}

export function useTetris(){
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
    const newUpcomingBlocks = structuredClone(upcomingBlocks) as Block[]
    const newBlock = newUpcomingBlocks.pop()
    newUpcomingBlocks.unshift(getRandomBlock())
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