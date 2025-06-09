import React from 'react';
import { type ScreenId } from '../routes/App'; // Importa o tipo ScreenId do App principal

interface SidebarProps {
    activeScreen: ScreenId;
    onNavigate: (screenId: ScreenId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onNavigate }) => {
    const sidebarItems = [
        { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard' },
        { id: 'clients', icon: 'fas fa-users', label: 'Clientes' },
        { id: 'stacks', icon: 'fas fa-layer-group', label: 'Stacks' },
        { id: 'services', icon: 'fas fa-cubes', label: 'Serviços' },
        { id: 'settings', icon: 'fas fa-cog', label: 'Configurações' },
    ];

    return (
        <div className="w-[200px] bg-[#1E1E1E] p-4 shadow-lg flex flex-col fixed h-full z-50
                    md:w-[200px] md:h-full md:flex-col md:shadow-lg
                    sm:w-full sm:h-auto sm:relative sm:flex-row sm:justify-around sm:p-2 sm:border-b sm:border-[#2E2E2E]">
            {sidebarItems.map((item) => (
                <div
                    key={item.id}
                    className={`flex items-center p-3 mb-2 rounded-md text-[#CCCCCC] cursor-pointer transition-colors duration-200
                      hover:bg-[#2A2A2A] hover:text-white
                      ${activeScreen === item.id || (item.id === 'clients' && activeScreen === 'client-detail') || (item.id === 'stacks' && activeScreen === 'stack-detail') || (item.id === 'services' && activeScreen === 'service-detail') ? 'bg-[#06B6D4] text-white' : ''}
                      sm:flex-col sm:text-center sm:p-2 sm:text-xs`}
                    onClick={() => onNavigate(item.id as ScreenId)}
                >
                    <i className={`${item.icon} mr-3 sm:mr-0 sm:mb-1 text-lg`}></i>
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    );
};
