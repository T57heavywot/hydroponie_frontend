import React from "react";

interface QuickActionsProps {
  selectedPlant: string;
  setSelectedPlant: (v: string) => void;
  plantBornes: any;
  onFlushReservoir: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  selectedPlant,
  setSelectedPlant,
  plantBornes,
  onFlushReservoir,
}) => (
  <div className="bg-white rounded-xl shadow p-10 flex flex-col gap-8 border border-gray-300 min-w-[350px] max-w-lg w-full">
    <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
      Actions rapides
    </h2>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Plante par défaut
      </label>
      <select
        className="border rounded px-2 py-1 w-full"
        value={selectedPlant}
        onChange={(e) => setSelectedPlant(e.target.value)}
      >
        <option value="">-- Choisir une plante --</option>
        {Object.keys(plantBornes).map((plant) => (
          <option key={plant} value={plant}>
            {plant.charAt(0).toUpperCase() + plant.slice(1)}
          </option>
        ))}
      </select>
    </div>
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-gray-700">Ouverture des valves</span>
        <div className="flex gap-2">
          <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
            Ouverture
          </button>
          <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
            Fermeture
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-gray-700">
          Ajouter des nutriments
        </span>
        <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
          Ajouter
        </button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-gray-700">
          Remplir le bac d'eau du système
        </span>
        <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
          Remplir
        </button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-gray-700">Vidanger le réservoir</span>
        <button
          className="px-4 py-1 border-2 border-red-600 text-red-600 rounded font-semibold bg-white hover:bg-red-50"
          onClick={onFlushReservoir}
        >
          Vidanger
        </button>
      </div>
    </div>
  </div>
);

export default QuickActions;
