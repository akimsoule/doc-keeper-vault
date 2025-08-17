import React from 'react';
import { Home, FileText, Search, Heart, Activity, Settings } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
    },
    {
      id: 'search',
      label: 'Recherche',
      icon: Search,
    },
    {
      id: 'favorites',
      label: 'Favoris',
      icon: Heart,
    },
    {
      id: 'activity',
      label: 'Activité',
      icon: Activity,
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Settings,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-base-100 border-t border-base-300 shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              className={`relative flex flex-col items-center justify-center gap-1 p-2 transition-colors duration-200 flex-1 h-full ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-base-content/60 hover:text-base-content/80 hover:bg-base-200'
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;
