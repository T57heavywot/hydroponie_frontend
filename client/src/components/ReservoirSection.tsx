import React from "react";
import GaugeBar from "./GaugeBar";
import WaterLevel from "./WaterLevel";

interface ReservoirSectionProps {
  latestData: {
    ecReservoir: number;
    phReservoir: number;
    oxygenReservoir: number;
    temperatureReservoir?: number;
  } | null;
  waterLevel: { level: number };
  editableBornes: {
    ecReservoir: { min: number; max: number };
    phReservoir: { min: number; max: number };
    oxygenReservoir: { min: number; max: number };
    temperatureReservoir?: { min: number; max: number };
    waterLevelReservoir?: { min: number; max: number };
  };
}

const ReservoirSection: React.FC<ReservoirSectionProps> = ({
  latestData,
  waterLevel,
  editableBornes,
}) => (
  <div>
    <h2 className="text-lg font-bold text-gray-700 mb-3 mt-2">Réservoir</h2>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* Conductivité réservoir */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow p-6 flex flex-col items-center border border-purple-200 hover:shadow-lg transition">
        <h3 className="text-base font-semibold text-purple-900 mb-1">
          Conductivité
        </h3>
        <span className="text-3xl font-extrabold text-purple-600 mb-1">
          {latestData ? latestData.ecReservoir.toFixed(2) + " µS/cm" : "--"}
        </span>
        <span className="text-xs text-purple-400">Dernière mesure</span>
        {latestData && editableBornes.ecReservoir && (
          <GaugeBar
            min={0}
            max={1500}
            value={latestData.ecReservoir}
            optimalMin={editableBornes.ecReservoir.min}
            optimalMax={editableBornes.ecReservoir.max}
            unit="µS/cm"
          />
        )}
        <span className="text-xs text-gray-500 mt-1">
          Intervalle recommandé :{" "}
          {editableBornes.ecReservoir
            ? `${editableBornes.ecReservoir.min} - ${editableBornes.ecReservoir.max} µS/cm`
            : "N/A"}
        </span>
      </div>
      {/* pH réservoir */}
      <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-xl shadow p-6 flex flex-col items-center border border-fuchsia-200 hover:shadow-lg transition">
        <h3 className="text-base font-semibold text-fuchsia-900 mb-1">pH</h3>
        <span className="text-3xl font-extrabold text-fuchsia-600 mb-1">
          {latestData ? latestData.phReservoir.toFixed(2) : "--"}
        </span>
        <span className="text-xs text-fuchsia-400">Dernière mesure</span>
        {latestData && editableBornes.phReservoir && (
          <GaugeBar
            min={0}
            max={14}
            value={latestData.phReservoir}
            optimalMin={editableBornes.phReservoir.min}
            optimalMax={editableBornes.phReservoir.max}
            unit="pH"
          />
        )}
        <span className="text-xs text-gray-500 mt-1">
          Intervalle recommandé :{" "}
          {editableBornes.phReservoir
            ? `${editableBornes.phReservoir.min} - ${editableBornes.phReservoir.max} pH`
            : "N/A"}
        </span>
      </div>
      {/* Oxygène réservoir */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 flex flex-col items-center border border-blue-200 hover:shadow-lg transition">
        <h3 className="text-base font-semibold text-blue-900 mb-1">
          Oxygène dissous
        </h3>
        <span className="text-3xl font-extrabold text-blue-600 mb-1">
          {latestData ? latestData.oxygenReservoir.toFixed(1) + " mg/L" : "--"}
        </span>
        <span className="text-xs text-blue-400">Dernière mesure</span>
        {latestData && editableBornes.oxygenReservoir && (
          <GaugeBar
            min={0}
            max={30}
            value={latestData.oxygenReservoir}
            optimalMin={editableBornes.oxygenReservoir.min}
            optimalMax={editableBornes.oxygenReservoir.max}
            unit="mg/L"
          />
        )}
        <span className="text-xs text-gray-500 mt-1">
          Intervalle recommandé :{" "}
          {editableBornes.oxygenReservoir
            ? `${editableBornes.oxygenReservoir.min} - ${editableBornes.oxygenReservoir.max} mg/L`
            : "N/A"}
        </span>
      </div>
      {/* Température réservoir */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 flex flex-col items-center border border-blue-200 hover:shadow-lg transition">
        <h3 className="text-base font-semibold text-blue-900 mb-1">
          Température
        </h3>
        <span className="text-3xl font-extrabold text-blue-600 mb-1">
          {latestData && typeof latestData.temperatureReservoir === "number"
            ? `${latestData.temperatureReservoir.toFixed(2)} °C`
            : "--"}
        </span>
        <span className="text-xs text-blue-400">Dernière mesure</span>
        {latestData &&
          editableBornes.temperatureReservoir &&
          typeof latestData.temperatureReservoir === "number" && (
            <div>
              <GaugeBar
                min={0}
                max={50}
                value={latestData.temperatureReservoir}
                optimalMin={editableBornes.temperatureReservoir.min}
                optimalMax={editableBornes.temperatureReservoir.max}
                unit="°C"
              />
              <span className="text-xs text-gray-500 mt-1">
                Intervalle recommandé :{" "}
                {editableBornes.temperatureReservoir.min} -{" "}
                {editableBornes.temperatureReservoir.max} °C
              </span>
            </div>
          )}
      </div>
      {/* Niveau d'eau du réservoir */}
      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl shadow p-6 flex flex-col items-center border border-cyan-200 hover:shadow-lg transition">
        <h3 className="text-base font-semibold text-cyan-900 mb-1">
          Niveau d'eau
        </h3>
        <WaterLevel level={waterLevel.level} displayLiters />
        {editableBornes.waterLevelReservoir && (
          <GaugeBar
            min={20}
            max={100}
            value={waterLevel.level}
            optimalMin={editableBornes.waterLevelReservoir.min}
            optimalMax={editableBornes.waterLevelReservoir.max}
            unit="L"
          />
        )}
        {editableBornes.waterLevelReservoir && (
          <span className="text-xs text-gray-500 mt-1">
            Intervalle recommandé : {editableBornes.waterLevelReservoir.min} -{" "}
            {editableBornes.waterLevelReservoir.max} L
          </span>
        )}
        {typeof waterLevel.level === "number" &&
          editableBornes.waterLevelReservoir &&
          waterLevel.level < editableBornes.waterLevelReservoir.min && (
            <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-lg text-sm">
              Niveau critique! Remplissez le réservoir dès que possible.
            </div>
          )}
        {typeof waterLevel.level === "number" &&
          !editableBornes.waterLevelReservoir &&
          waterLevel.level < 20 && (
            <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-lg text-sm">
              Niveau critique! Remplissez le réservoir dès que possible.
            </div>
          )}
      </div>
    </div>
  </div>
);

export default ReservoirSection;
