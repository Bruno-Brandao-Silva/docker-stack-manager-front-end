import React, { type ReactNode } from 'react';

interface ModalProps {
    id: string;
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    isEditMode?: boolean; // Prop opcional para a lógica do título do modal
}

export const Modal: React.FC<ModalProps> = ({ id, title, isOpen, onClose, children, isEditMode }) => {
    if (!isOpen) return null;

    return (
        <div id={id} className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[1000] opacity-100 visible transition-opacity duration-300 ease-in-out">
            <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-8 w-[90%] max-w-[600px] shadow-2xl translate-y-0 transition-transform duration-300 ease-in-out">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#2E2E2E]">
                    <h3 className="text-2xl text-white">{title}</h3>
                    <button className="bg-none border-none text-3xl text-[#CCCCCC] cursor-pointer transition-colors duration-200 hover:text-white" onClick={onClose}>&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};
