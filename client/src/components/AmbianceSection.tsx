import React from "react";
import GaugeBar from "./GaugeBar";

interface AmbianceSectionProps {
  latestData: {
    temperature: number;
    humidity: number;
  } | null;
  editableBornes: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
  };
}

const AmbianceSection: React.FC<AmbianceSectionProps> = ({ latestData, editableBornes }) => (
  <div>
    <h2 className="text-lg font-bold text-gray-700 mb-3">Ambiance</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Température ambiante */}
      <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl shadow p-6 flex flex-col items-center border border-sky-200 hover:shadow-lg transition">
        <h3 className="text-base font-semibold text-sky-900 mb-1">Température ambiante</h3>
        <span className="text-3xl font-extrabold text-sky-600 mb-1">
          {latestData ? latestData.temperature.toFixed(1) + " °C" : "--"}
        </span>
        <span className="text-xs text-sky-400">Dernière mesure</span>
        {latestData && (
          <GaugeBar
            min={0}
            max={40}
            value={latestData.temperature}
            optimalMin={editableBornes.temperature.min}
            optimalMax={editableBornes.temperature.max}
            unit="°C"
          />
        )}
        <span className="text-xs text-gray-500 mt-1">
          Intervalle recommandé : {editableBornes.temperature.min} - {editableBornes.temperature.max} °C
        </span>
      </div>
      {/* Humidité ambiante */}
      <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl shadow p-6 flex flex-col items-center border border-violet-200 hover:shadow-lg transition">
        <h3 className="text-base font-semibold text-violet-900 mb-1">Humidité ambiante</h3>
        <span className="text-3xl font-extrabold text-violet-600 mb-1">
          {latestData ? latestData.humidity.toFixed(1) + " %" : "--"}
        </span>
        <span className="text-xs text-violet-400">Dernière mesure</span>
        {latestData && (
          <GaugeBar
            min={0}
            max={100}
            value={latestData.humidity}
            optimalMin={editableBornes.humidity.min}
            optimalMax={editableBornes.humidity.max}
            unit="%"
          />
        )}
        <span className="text-xs text-gray-500 mt-1">
          Intervalle recommandé : {editableBornes.humidity.min} - {editableBornes.humidity.max} %
        </span>
      </div>
    </div>
  </div>
);

export default AmbianceSection;
