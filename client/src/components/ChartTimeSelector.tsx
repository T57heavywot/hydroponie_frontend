import React from "react";

interface ChartTimeSelectorProps {
  selectedHours: number;
  setSelectedHours: (hours: number) => void;
}

const options = [3, 6, 12, 24];

const ChartTimeSelector: React.FC<ChartTimeSelectorProps> = ({
  selectedHours,
  setSelectedHours,
}) => (
  <div className="flex gap-2 items-center mb-4">
    <span className="font-medium text-gray-700">Période :</span>
    {options.map((h) => (
      <button
        key={h}
        className={`px-3 py-1 rounded font-semibold border transition-colors duration-150 ${
          selectedHours === h
            ? "bg-green-600 text-white border-green-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
        }`}
        onClick={() => setSelectedHours(h)}
      >
        {h}h
      </button>
    ))}
  </div>
);

export default ChartTimeSelector;
