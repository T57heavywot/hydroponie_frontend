import React from "react";
import "./WaterLevel.css";

interface WaterLevelProps {
  level: number;
}

const WaterLevel: React.FC<WaterLevelProps> = ({ level }) => {
  const isLow = level < 18;
  return (
    <div className="reservoir-container">
      <div className="reservoir">
        <div
          className="water"
          style={{ height: `${level}%` }}
        >
          {!isLow && (
            <span className="water-label">{level}%</span>
          )}
        </div>
        {isLow && (
          <span className="water-label" style={{ color: '#1976d2', bottom: '8px', top: 'unset', textShadow: '0 1px 4px #fff' }}>{level}%</span>
        )}
      </div>
    </div>
  );
};

export default WaterLevel;
