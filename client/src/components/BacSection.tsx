import React from "react";
import GaugeBar from "./GaugeBar";
import WaterLevel from "./WaterLevel";

interface BacSectionProps {
  latestData: {
    ecBac: number;
    phBac: number;
    oxygenBac: number;
  } | null;
  waterLevel: { level: number };
  editableBornes: {
    ecBac: { min: number; max: number };
    phBac: { min: number; max: number };
    oxygenBac: { min: number; max: number };
  };
}

const BacSection: React.FC<BacSectionProps> = ({ latestData, waterLevel, editableBornes }) => (
  <div>
    <h2 className="text-lg font-bold text-gray-700 mb-3 mt-2">Bac du système</h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Conductivité bac */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow p-6 flex flex-col items-center border border-purple-200 hover:shadow-lg transition">
        <h3 className="text-base font-semibold text-purple-900 mb-1">Conductivité</h3>
        <span className="text-3xl font-extrabold text-purple-600 mb-1">
          {latestData ? latestData.ecBac.toFixed(2) + " mS/cm" : "--"}
        </span>
        <span className="text-xs text-purple-400">Dernière mesure</span>
        {latestData && editableBornes.ecBac && (
          <GaugeBar
            min={0}
            max={3}
            value={latestData.ecBac}
            optimalMin={editableBornes.ecBac.min}
            optimalMax={editableBornes.ecBac.max}
            unit="mS/cm"
          />
        )}
        <span className="text-xs text-gray-500 mt-1">
          Intervalle recommandé : {editableBornes.ecBac && editableBornes.ecBac.min !== undefined && editableBornes.ecBac.max !== undefined ? `${editableBornes.ecBac.min} - ${editableBornes.ecBac.max} mS/cm` : 'N/A'}
        </span>
      </div>
      {/* pH bac */}
      <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-xl shadow p-6 flex flex-col items-center border border-fuchsia-200 hover:shadow-lg transition">
        <h3 className="text-base font-semibold text-fuchsia-900 mb-1">pH</h3>
        <span className="text-3xl font-extrabold text-fuchsia-600 mb-1">
          {latestData ? latestData.phBac.toFixed(2) : "--"}
        </span>
        <span className="text-xs text-fuchsia-400">Dernière mesure</span>
        {latestData && editableBornes.phBac && (
          <GaugeBar
            min={0}
            max={14}
            value={latestData.phBac}
            optimalMin={editableBornes.phBac.min}
            optimalMax={editableBornes.phBac.max}
            unit="pH"
          />
        )}
        <span className="text-xs text-gray-500 mt-1">
          Intervalle recommandé : {editableBornes.phBac && editableBornes.phBac.min !== undefined && editableBornes.phBac.max !== undefined ? `${editableBornes.phBac.min} - ${editableBornes.phBac.max} pH` : 'N/A'}
        </span>
      </div>
      {/* Oxygène bac */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 flex flex-col items-center border border-blue-200 hover:shadow-lg transition">
        <h3 className="text-base font-semibold text-blue-900 mb-1">Oxygène dissous</h3>
        <span className="text-3xl font-extrabold text-blue-600 mb-1">
          {latestData ? latestData.oxygenBac.toFixed(1) + " mg/L" : "--"}
        </span>
        <span className="text-xs text-blue-400">Dernière mesure</span>
        {latestData && editableBornes.oxygenBac && (
          <GaugeBar
            min={0}
            max={100}
            value={latestData.oxygenBac}
            optimalMin={editableBornes.oxygenBac.min}
            optimalMax={editableBornes.oxygenBac.max}
            unit="mg/L"
          />
        )}
        <span className="text-xs text-gray-500 mt-1">
          Intervalle recommandé : {editableBornes.oxygenBac && editableBornes.oxygenBac.min !== undefined && editableBornes.oxygenBac.max !== undefined ? `${editableBornes.oxygenBac.min} - ${editableBornes.oxygenBac.max} %` : 'N/A'}
        </span>
      </div>
      {/* Niveau d'eau du bac du système */}
      <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl shadow p-6 flex flex-col items-center border border-rose-200 hover:shadow-lg transition">
        <h3 className="text-base font-semibold text-rose-900 mb-1">Niveau d'eau</h3>
        <WaterLevel level={Math.max(0, waterLevel.level - 55)} />
        {waterLevel.level - 55 < 20 && (
          <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-lg text-sm">
            Niveau critique! Remplissez le réservoir dès que possible.
          </div>
        )}
      </div>
    </div>
  </div>
);

export default BacSection;
