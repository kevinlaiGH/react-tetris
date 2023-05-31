import Board from "./components/Board";
import { useTetris } from "./hooks/useTetris";

function App() {
  const { board, startGame, isPlaying, score } = useTetris();
  return (
    <div className="App">
      <h1>Tetris</h1>
      <Board currentBoard={board} />
      <div className="controls">
        <h2>Score: {score}</h2>
        {isPlaying ? null : <button onClick={startGame}>New Game</button>}
      </div>
    </div>
  );
}

export default App;
