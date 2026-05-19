import React from 'react';

const Island = ({ island, onClick, isSelected, hasCursor }) => {
  const cx = island.x * 40;
  const cy = island.y * 40;
  const r = 20;
  const strokeColor = isSelected ? '#ff0' : hasCursor ? '#0ff' : '#0f0';
  const strokeWidth = isSelected ? 4 : hasCursor ? 3 : 2;
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <circle cx={cx} cy={cy} r={r} fill="black" stroke={strokeColor} strokeWidth={strokeWidth} />
      {hasCursor && (
        <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke="#0ff" strokeWidth="1" strokeDasharray="4 3">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#0f0" fontSize="16" fontWeight="bold">
        {island.value}
      </text>
    </g>
  );
};

export default Island;
