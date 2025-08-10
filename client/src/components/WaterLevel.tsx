import React from "react";
import "./WaterLevel.css";

interface WaterLevelProps {
  level: number;
  displayLiters?: boolean;
}

const WaterLevel: React.FC<WaterLevelProps> = ({ level, displayLiters }) => {
  const isLow = level < 18;
  return (
    <div className="reservoir-container">
      <div className="reservoir">
        <div
          className="water"
          style={{ height: `${Math.max(0, Math.min(100, level))}%` }}
        >
          {!isLow && (
            <span className="water-label">
              {displayLiters ? `${level.toFixed(0)} L` : `${level}%`}
            </span>
          )}
        </div>
        {isLow && (
          <span className="water-label" style={{ color: '#1976d2', bottom: '8px', top: 'unset', textShadow: '0 1px 4px #fff' }}>
            {displayLiters ? `${level.toFixed(0)} L` : `${level}%`}
          </span>
        )}
      </div>
    </div>
  );
};

export default WaterLevel;
