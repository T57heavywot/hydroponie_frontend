import React, { useState } from "react";

interface Actuator {
  id: string;
  name: string;
  isOpen: boolean;
}

interface ActuatorsModalProps {
  show: boolean;
  onClose: () => void;
  actuators: Actuator[];
  onToggle: (id: string, open: boolean) => void;
}

const ActuatorsModal: React.FC<ActuatorsModalProps> = ({ show, onClose, actuators, onToggle }) => {
  // Empêche la fermeture tant qu'un actionneur est ouvert
  const allClosed = actuators.every((a) => !a.isOpen);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[350px] max-w-md w-full relative">
        <h2 className="text-xl font-bold mb-4 text-center">Contrôle des actionneurs</h2>
        <div className="flex flex-col gap-4">
          {actuators.map((actuator) => (
            <div key={actuator.id} className="flex items-center justify-between gap-2">
              <span className="font-medium text-gray-700">{actuator.name}</span>
              <button
                className={`px-4 py-1 rounded font-semibold border-2 ${
                  actuator.isOpen
                    ? "bg-red-100 text-red-700 border-red-600 hover:bg-red-200"
                    : "bg-green-100 text-green-700 border-green-600 hover:bg-green-200"
                }`}
                onClick={() => onToggle(actuator.id, !actuator.isOpen)}
              >
                {actuator.isOpen ? "Fermer" : "Ouvrir"}
              </button>
            </div>
          ))}
        </div>
        <button
          className={`mt-6 w-full px-4 py-2 rounded font-semibold bg-gray-800 text-white hover:bg-gray-900 transition disabled:opacity-50 ${
            !allClosed ? "cursor-not-allowed" : ""}
          `}
          onClick={onClose}
          disabled={!allClosed}
        >
          Fermer
        </button>
        {!allClosed && (
          <p className="text-xs text-center text-red-500 mt-2">Vous devez fermer tous les actionneurs pour quitter.</p>
        )}
      </div>
    </div>
  );
};

export default ActuatorsModal;
