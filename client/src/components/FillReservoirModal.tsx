import React from "react";
import PopUpModal from "./PopUpModal";

interface FillReservoirModalProps {
  show: boolean;
  onClose: () => void;
  onDone: () => void;
}

const FillReservoirModal: React.FC<FillReservoirModalProps> = ({ show, onClose, onDone }) => {
  return (
    <PopUpModal
      show={show}
      title="Remplissage du réservoir"
      onClose={onClose}
      actions={
        <button
          className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
          onClick={onDone}
        >
          Terminé
        </button>
      }
    >
      <p>Le remplissage du réservoir est en cours.<br />Cliquez sur "Terminé" une fois le remplissage effectué.</p>
    </PopUpModal>
  );
};

export default FillReservoirModal;
