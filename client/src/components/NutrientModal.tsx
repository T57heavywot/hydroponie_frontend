import React, { useState } from "react";
import PopUpModal from "./PopUpModal";

interface NutrientModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (values: { type: string; value: number }[]) => void;
}

const NUTRIENT_TYPES = [
  { key: "nutrient1", label: "Nutriment 1" },
  { key: "nutrient2", label: "Nutriment 2" },
  { key: "nutrient3", label: "Nutriment 3" },
];

const NutrientModal: React.FC<NutrientModalProps> = ({ show, onClose, onSubmit }) => {
  // Volume d'eau ajouté (fake)
  const fakeVolume = 10; // en Litres prochaine étape, remplacer par une valeur ddynamqiue récupérée depuis le backend (faaire la soustraction avant remplissage et après remplissage)
  const [values, setValues] = useState<{ [key: string]: number }>({});

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: parseFloat(val) }));
  };

  const handleSubmit = () => {
    onSubmit(NUTRIENT_TYPES.map((nutrient) => ({
      type: nutrient.key,
      value: values[nutrient.key] || 0,
    })));
    onClose();
  };

  return (
    <PopUpModal
      show={show}
      title="Ajouter des nutriments"
      onClose={onClose}
      actions={
        <button
          className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
          onClick={handleSubmit}
        >
          Valider
        </button>
      }
    >
      <div className="mb-4 text-center">
        <span className="font-semibold text-gray-700">Volume d'eau ajouté : </span>
        <span className="text-blue-700 font-bold">{fakeVolume} Litres</span>
      </div>
      <div className="flex flex-col gap-4">
        {NUTRIENT_TYPES.map((nutrient) => (
          <div key={nutrient.key} className="flex items-center gap-2">
            <label className="w-32 font-medium">{nutrient.label}</label>
            <input
              type="number"
              min={0}
              step={1}
              className="border rounded px-2 py-1 w-24"
              value={values[nutrient.key] || ""}
              onChange={(e) => handleChange(nutrient.key, e.target.value)}
              placeholder="ml"
            />
            <span>ml</span>
          </div>
        ))}
      </div>
    </PopUpModal>
  );
};

export default NutrientModal;
