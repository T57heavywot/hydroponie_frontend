import React from "react";

interface AddPlantModalProps {
  show: boolean;
  onClose: () => void;
  plantName: string;
  setPlantName: (name: string) => void;
  plantBornes: any;
  setPlantBornes: (b: any) => void;
  onSubmit: () => void;
  paramLabels: Record<string, string>;
}

const AddPlantModal: React.FC<AddPlantModalProps> = ({
  show,
  onClose,
  plantName,
  setPlantName,
  plantBornes,
  setPlantBornes,
  onSubmit,
  paramLabels,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[350px] max-w-lg w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
          onClick={onClose}
          title="Fermer"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4">Ajouter une nouvelle configuration</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la configuration
            </label>
            <input
              type="text"
              className="border rounded px-2 py-1 w-full"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              required
            />
          </div>
          {Object.entries(plantBornes)
            .filter(
              ([key]) =>
                key !== "waterLevelReservoir" && key !== "waterLevelBac"
            )
            .map(([key, val]) => {
              const v = val as { min: number; max: number };
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-48 font-medium text-gray-700">
                    {paramLabels[key] || key}
                  </span>
                  <label className="text-sm">Min</label>
                  <input
                    type="number"
                    step="any"
                    className="border rounded px-2 py-1 w-20"
                    value={v.min}
                    onChange={(e) =>
                      setPlantBornes((b: any) => ({
                        ...b,
                        [key]: { ...b[key], min: parseFloat(e.target.value) },
                      }))
                    }
                    required
                  />
                  <label className="text-sm">Max</label>
                  <input
                    type="number"
                    step="any"
                    className="border rounded px-2 py-1 w-20"
                    value={v.max}
                    onChange={(e) =>
                      setPlantBornes((b: any) => ({
                        ...b,
                        [key]: { ...b[key], max: parseFloat(e.target.value) },
                      }))
                    }
                    required
                  />
                </div>
              );
            })}
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 self-end"
          >
            Ajouter la configuration
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPlantModal;
