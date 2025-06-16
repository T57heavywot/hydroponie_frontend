import React from 'react';

interface GaugeProps {
  min: number;
  max: number;
  value: number;
  optimalMin: number;
  optimalMax: number;
  unit?: string;
}

const GaugeBar: React.FC<GaugeProps> = ({ min, max, value, optimalMin, optimalMax, unit }) => {
  const percent = ((value - min) / (max - min)) * 100;
  const optimalStart = ((optimalMin - min) / (max - min)) * 100;
  const optimalEnd = ((optimalMax - min) / (max - min)) * 100;

  return (
    <div className="w-full mt-2">
      <div className="relative h-4 rounded bg-gray-200 overflow-hidden">
        {/* Zone optimale */}
        <div
          className="absolute top-0 h-4 bg-green-300 opacity-60"
          style={{ left: `${optimalStart}%`, width: `${optimalEnd - optimalStart}%` }}
        />
        {/* Curseur valeur actuelle */}
        <div
          className="absolute top-0 h-4 w-1 bg-fuchsia-600 rounded"
          style={{ left: `calc(${percent}% - 2px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}</span>
        <span>{unit ? unit : ''}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default GaugeBar;
