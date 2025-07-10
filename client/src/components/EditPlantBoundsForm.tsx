import React from "react";

interface EditPlantBoundsFormProps {
  editableBornes: any;
  setEditableBornes: React.Dispatch<React.SetStateAction<any>>;
  selectedPlant: string;
  setPlantBornes: React.Dispatch<React.SetStateAction<any>>;
  PARAM_LABELS: Record<string, string>;
}

// Utilisation de React.memo pour éviter les re-rendus inutiles si les props ne changent pas
const EditPlantBoundsForm: React.FC<EditPlantBoundsFormProps> = React.memo(({
  editableBornes,
  setEditableBornes,
  selectedPlant,
  setPlantBornes,
  PARAM_LABELS,
}) => (
  <form
    className="flex flex-col gap-4"
    onSubmit={(e) => {
      e.preventDefault();
    }}
  >
    {Object.entries(editableBornes)
      .filter(
        ([key]) => key !== "waterLevelReservoir" && key !== "waterLevelBac"
      )
      .map(([key, val]) => {
        const typedKey = key as keyof typeof editableBornes;
        // Cast val to the expected type to satisfy TypeScript
        const bounds = val as { min: number; max: number };
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="w-48 font-medium text-gray-700">
              {PARAM_LABELS[key] || key}
            </span>
            <label className="text-sm">Min</label>
            <input
              type="number"
              step="any"
              className="border rounded px-2 py-1 w-20"
              value={bounds.min}
              onChange={(e) =>
                setEditableBornes((b: any) => ({
                  ...b,
                  [typedKey]: {
                    ...b[typedKey],
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
              value={bounds.max}
              onChange={(e) =>
                setEditableBornes((b: any) => ({
                  ...b,
                  [typedKey]: {
                    ...b[typedKey],
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
));

export default EditPlantBoundsForm;
