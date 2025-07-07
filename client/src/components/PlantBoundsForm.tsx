import React from "react";

interface PlantBoundsFormProps {
  editableBornes: any;
  setEditableBornes: (b: any) => void;
  selectedPlant: string;
  setPlantBornes: (fn: (prev: any) => any) => void;
  paramLabels: Record<string, string>;
}

const PlantBoundsForm: React.FC<PlantBoundsFormProps> = ({
  editableBornes,
  setEditableBornes,
  selectedPlant,
  setPlantBornes,
  paramLabels,
}) => (
  <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
    {Object.entries(editableBornes)
      .filter(
        ([key]) => key !== "waterLevelReservoir" && key !== "waterLevelBac"
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
                setEditableBornes((b: any) => ({
                  ...b,
                  [key]: {
                    ...b[key],
                    min: parseFloat(e.target.value),
                  },
                }))
              }
            />
            <label className="text-sm">Max</label>
            <input
              type="number"
              step="any"
              className="border rounded px-2 py-1 w-20"
              value={v.max}
              onChange={(e) =>
                setEditableBornes((b: any) => ({
                  ...b,
                  [key]: {
                    ...b[key],
                    max: parseFloat(e.target.value),
                  },
                }))
              }
            />
          </div>
        );
      })}
    <button
      type="button"
      className="mt-4 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 self-end"
      onClick={() => {
        if (selectedPlant) {
          setPlantBornes((prev: any) => ({
            ...prev,
            [selectedPlant]: { ...editableBornes },
          }));
          alert("Bornes enregistrées pour la plante sélectionnée !");
        }
      }}
    >
      Enregistrer
    </button>
  </form>
);

export default PlantBoundsForm;
