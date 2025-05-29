import React from "react";
import "./WaterLevel.css";

interface WaterLevelProps {
  level: number; // 0 à 100
}

const WaterLevel: React.FC<WaterLevelProps> = ({ level }) => {
  return (
    <div className="reservoir-container">
      <div className="reservoir">
        <div
          className="water"
          style={{ height: `${level}%` }}
        >
          <span className="water-label">{level}%</span>
        </div>
      </div>
      <div className="labels">
        <span>Critique</span>
        <span>Plein</span>
      </div>
    </div>
  );
};

export default WaterLevel;
