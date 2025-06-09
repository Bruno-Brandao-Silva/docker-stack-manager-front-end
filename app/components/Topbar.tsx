import React from 'react';

export const Topbar: React.FC = () => {
    return (
        <div className="bg-[#1E1E1E] p-4 px-8 flex justify-between items-center shadow-lg z-40">
            <div className="font-jetbrains-mono font-bold text-2xl text-[#06B6D4]">Docker Stack Manager</div>
            <div className="text-2xl text-[#CCCCCC] cursor-pointer">
                <i className="fas fa-user-circle"></i>
            </div>
        </div>
    );
};
