import React, { useEffect } from 'react';
import Island from './Island';
import { canAddBridge } from '../utils/hashiLogic';

const getKey = (a, b) => {
  if (a.x < b.x || (a.x === b.x && a.y < b.y)) {
    return `${a.x},${a.y},${b.x},${b.y}`;
  }
  return `${b.x},${b.y},${a.x},${a.y}`;
};

const Board = ({ islands, bridges, onBridgeUpdate, selectedIsland, setSelectedIsland, cursorPos, setCursorPos }) => {
  const toggleBridge = (from, to) => {
    const key = getKey(from, to);
    const current = bridges.get(key) || 0;
    if (current === 2) {
      const newBridges = new Map(bridges);
      newBridges.delete(key);
      onBridgeUpdate(newBridges, null);
      return;
    }
    const { valid, error } = canAddBridge(islands, bridges, from, to, 1);
    if (valid) {
      const newBridges = new Map(bridges);
      newBridges.set(key, current + 1);
      onBridgeUpdate(newBridges, null);
    } else {
      onBridgeUpdate(bridges, error);
    }
  };

  const handleIslandClick = (island) => {
    if (selectedIsland === null) {
      setSelectedIsland(island);
    } else if (selectedIsland.id === island.id) {
      setSelectedIsland(null);
    } else {
      toggleBridge(selectedIsland, island);
      setSelectedIsland(null);
    }
  };

const handleBridgeRightClick = (e, key) => {
  e.preventDefault();
  if (!bridges.has(key)) return;
  const newBridges = new Map(bridges);
  newBridges.delete(key);
  onBridgeUpdate(newBridges, null);
};

  useEffect(() => {
    const findNearest = (from, direction) => {
      let candidates = [];
      if (direction === 'ArrowRight') candidates = islands.filter(i => i.y === from.y && i.x > from.x);
      else if (direction === 'ArrowLeft') candidates = islands.filter(i => i.y === from.y && i.x < from.x);
      else if (direction === 'ArrowDown') candidates = islands.filter(i => i.x === from.x && i.y > from.y);
      else if (direction === 'ArrowUp') candidates = islands.filter(i => i.x === from.x && i.y < from.y);
      candidates.sort((a, b) => {
        if (direction === 'ArrowRight') return a.x - b.x;
        if (direction === 'ArrowLeft') return b.x - a.x;
        if (direction === 'ArrowDown') return a.y - b.y;
        return b.y - a.y;
      });
      return candidates[0] || null;
    };

    const handleKeyDown = (e) => {
      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (arrowKeys.includes(e.key)) {
        e.preventDefault();
        const source = selectedIsland || (cursorPos ? islands.find(i => i.id === cursorPos.id) : null);
        if (!source) return;
        const next = findNearest(source, e.key);
        if (next) setCursorPos({ x: next.x, y: next.y, id: next.id });
      } else if (e.key === 'Enter') {
        if (!cursorPos) return;
        const cursorIsland = islands.find(i => i.id === cursorPos.id);
        if (!cursorIsland) return;
        if (!selectedIsland) {
          setSelectedIsland(cursorIsland);
        } else {
          const key = getKey(selectedIsland, cursorIsland);
          const current = bridges.get(key) || 0;
          if (current === 2) {
            const newBridges = new Map(bridges);
            newBridges.delete(key);
            onBridgeUpdate(newBridges, null);
          } else {
            const { valid, error } = canAddBridge(islands, bridges, selectedIsland, cursorIsland, 1);
            if (valid) {
              const newBridges = new Map(bridges);
              newBridges.set(key, current + 1);
              onBridgeUpdate(newBridges, null);
            } else {
              onBridgeUpdate(bridges, error);
            }
          }
          setSelectedIsland(null);
        }
      } else if (e.key === 'Escape') {
        if (selectedIsland) {
          setCursorPos({ x: selectedIsland.x, y: selectedIsland.y, id: selectedIsland.id });
        }
        setSelectedIsland(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [islands, selectedIsland, cursorPos, bridges, setCursorPos, setSelectedIsland, onBridgeUpdate]);

  return (
    <svg width="800" height="600" viewBox="0 0 800 600" style={{ backgroundColor: 'black' }}>
      {Array.from(bridges.entries()).map(([key, count]) => {
        const [x1, y1, x2, y2] = key.split(',').map(Number);
        const island1 = islands.find(i => i.x === x1 && i.y === y1);
        const island2 = islands.find(i => i.x === x2 && i.y === y2);
        if (!island1 || !island2) return null;
        const x1px = island1.x * 40, y1px = island1.y * 40;
        const x2px = island2.x * 40, y2px = island2.y * 40;
        const isHorizontal = (y1 === y2);
        if (count === 1) {
          return (
            <line
              key={key}
              x1={x1px} y1={y1px} x2={x2px} y2={y2px}
              stroke="#0f0" strokeWidth="4"
              style={{ cursor: 'pointer' }}
              onContextMenu={(e) => handleBridgeRightClick(e, key)}
            />
          );
        } else if (count === 2) {
          if (isHorizontal) {
            return (
              <g key={key} onContextMenu={(e) => handleBridgeRightClick(e, key)} style={{ cursor: 'pointer' }}>
                <line x1={x1px} y1={y1px - 4} x2={x2px} y2={y2px - 4} stroke="#0f0" strokeWidth="2" />
                <line x1={x1px} y1={y1px + 4} x2={x2px} y2={y2px + 4} stroke="#0f0" strokeWidth="2" />
              </g>
            );
          } else {
            return (
              <g key={key} onContextMenu={(e) => handleBridgeRightClick(e, key)} style={{ cursor: 'pointer' }}>
                <line x1={x1px - 4} y1={y1px} x2={x2px - 4} y2={y2px} stroke="#0f0" strokeWidth="2" />
                <line x1={x1px + 4} y1={y1px} x2={x2px + 4} y2={y2px} stroke="#0f0" strokeWidth="2" />
              </g>
            );
          }
        }
        return null;
      })}
      {islands.map(island => (
        <Island
          key={island.id}
          island={island}
          onClick={() => handleIslandClick(island)}
          isSelected={selectedIsland?.id === island.id}
          hasCursor={cursorPos?.id === island.id}
        />
      ))}
    </svg>
  );
};

export default Board;
