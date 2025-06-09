import React, { type ReactNode } from 'react';

interface AccordionItemProps {
    title: string;
    children: ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onToggle }) => {
    return (
        <div className={`mb-4 border border-[#2E2E2E] rounded-lg overflow-hidden ${isOpen ? 'active' : ''}`}>
            <div className="bg-[#2A2A2A] p-4 px-6 cursor-pointer flex justify-between items-center font-semibold text-white transition-colors duration-200 hover:bg-[#2E2E2E]" onClick={onToggle}>
                <h3>{title}</h3>
                <i className={`fas ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </div>
            <div className={`p-4 px-6 bg-[#1E1E1E] space-y-3 ${isOpen ? 'block' : 'hidden'}`}>
                {children}
            </div>
        </div>
    );
};
