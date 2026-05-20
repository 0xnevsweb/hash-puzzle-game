import React, { useState, useCallback } from 'react';
import { puzzles } from './data/puzzles';
import Board from './components/Board';
import './App.css';

const buildIslands = (puzzle) => puzzle.islands.map((isl, idx) => ({ ...isl, id: idx }));

const initialPuzzle = puzzles.find(p => p.id === 1) || puzzles[0];
const initialIslands = buildIslands(initialPuzzle);
const initialCursor = initialIslands.length > 0
  ? { x: initialIslands[0].x, y: initialIslands[0].y, id: 0 }
  : null;

const App = () => {
  const [currentPuzzleId, setCurrentPuzzleId] = useState(initialPuzzle.id);
  const [islands, setIslands] = useState(initialIslands);
  const [bridges, setBridges] = useState(new Map());
  const [errorMsg, setErrorMsg] = useState('');
  const [victory, setVictory] = useState(false);
  const [selectedIsland, setSelectedIsland] = useState(null);
  const [cursorPos, setCursorPos] = useState(initialCursor);

  const loadPuzzle = useCallback((puzzleId) => {
    const puzzle = puzzles.find(p => p.id === puzzleId);
    if (!puzzle) return;
    const newIslands = buildIslands(puzzle);
    setCurrentPuzzleId(puzzleId);
    setIslands(newIslands);
    setBridges(new Map());
    setSelectedIsland(null);
    setErrorMsg('');
    setVictory(false);
    setCursorPos(newIslands.length > 0
      ? { x: newIslands[0].x, y: newIslands[0].y, id: 0 }
      : null);
  }, []);

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
        <select value={currentPuzzleId} onChange={(e) => loadPuzzle(Number(e.target.value))}>
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
