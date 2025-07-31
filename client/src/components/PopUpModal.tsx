import React from "react";

interface PopUpModalProps {
  show: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  actions?: React.ReactNode;
}

const PopUpModal: React.FC<PopUpModalProps> = ({ show, title, children, onClose, actions }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">×</button>
        </div>
        <div className="mb-4">{children}</div>
        {actions && <div className="flex gap-2 justify-end">{actions}</div>}
      </div>
    </div>
  );
};

export default PopUpModal;
