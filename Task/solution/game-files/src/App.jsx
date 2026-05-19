import React, { useState, useEffect, useCallback } from 'react';
import { puzzles } from './data/puzzles';
import Board from './components/Board';
import './App.css';

const App = () => {
  const [currentPuzzleId, setCurrentPuzzleId] = useState(1);
  const [islands, setIslands] = useState([]);
  const [bridges, setBridges] = useState(new Map());
  const [errorMsg, setErrorMsg] = useState('');
  const [victory, setVictory] = useState(false);
  const [selectedIsland, setSelectedIsland] = useState(null);
  const [cursorPos, setCursorPos] = useState(null);

  const loadPuzzle = useCallback((puzzleId) => {
    const puzzle = puzzles.find(p => p.id === puzzleId);
    if (puzzle) {
      setIslands(puzzle.islands.map((isl, idx) => ({ ...isl, id: idx })));
      setBridges(new Map());
      setSelectedIsland(null);
      setErrorMsg('');
      setVictory(false);
      if (puzzle.islands.length > 0) {
        setCursorPos({ x: puzzle.islands[0].x, y: puzzle.islands[0].y, id: 0 });
      } else {
        setCursorPos(null);
      }
    }
  }, []);

  useEffect(() => {
    loadPuzzle(currentPuzzleId);
  }, [currentPuzzleId, loadPuzzle]);

  const handleBridgeUpdate = useCallback((newBridges, error) => {
    if (error) {
      setErrorMsg(error);
    } else {
      setBridges(newBridges);
      setErrorMsg('');
      import('./utils/hashiLogic').then(module => {
        if (module.isVictory(islands, newBridges)) setVictory(true);
        else setVictory(false);
      });
    }
  }, [islands]);

  const resetPuzzle = () => {
    setBridges(new Map());
    setErrorMsg('');
    setVictory(false);
    setSelectedIsland(null);
    import('./utils/hashiLogic').then(module => {
      if (module.isVictory(islands, new Map())) setVictory(false);
    });
  };

  return (
    <div className="app">
      <Board
        islands={islands}
        bridges={bridges}
        onBridgeUpdate={handleBridgeUpdate}
        selectedIsland={selectedIsland}
        setSelectedIsland={setSelectedIsland}
        cursorPos={cursorPos}
        setCursorPos={setCursorPos}
      />
      <div className="controls">
        <select value={currentPuzzleId} onChange={(e) => setCurrentPuzzleId(Number(e.target.value))}>
          {puzzles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button onClick={resetPuzzle}>Reset</button>
      </div>
      {victory && <div className="victory-banner">SOLVED!</div>}
      {errorMsg && <div className="error-message">{errorMsg}</div>}
    </div>
  );
};

export default App;
