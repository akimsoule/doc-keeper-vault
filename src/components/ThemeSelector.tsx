import React from "react";
import { useTheme, Theme } from "../hooks/useTheme";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { Sun, Moon, Palette, Monitor } from 'lucide-react';

const themes = [
  { name: "doc-keeper", label: "Doc Keeper Clair", icon: <Sun className="w-4 h-4" /> },
  { name: "doc-keeper-dark", label: "Doc Keeper Sombre", icon: <Moon className="w-4 h-4" /> },
  { name: "light", label: "Clair Standard", icon: <Monitor className="w-4 h-4" /> },
  { name: "dark", label: "Sombre Standard", icon: <Palette className="w-4 h-4" /> },
  // { name: "cupcake", label: "Cupcake", icon: <Palette className="w-4 h-4" /> },
  // { name: "bumblebee", label: "Bumblebee", icon: <Palette className="w-4 h-4" /> },
  // { name: "emerald", label: "Emerald", icon: <Palette className="w-4 h-4" /> },
  // { name: "corporate", label: "Corporate", icon: <Palette className="w-4 h-4" /> },
  // { name: "synthwave", label: "Synthwave", icon: <Palette className="w-4 h-4" /> },
  // { name: "retro", label: "Retro", icon: <Palette className="w-4 h-4" /> },
  // { name: "cyberpunk", label: "Cyberpunk", icon: <Palette className="w-4 h-4" /> },
  // { name: "valentine", label: "Valentine", icon: <Palette className="w-4 h-4" /> },
  // { name: "halloween", label: "Halloween", icon: <Palette className="w-4 h-4" /> },
  // { name: "garden", label: "Garden", icon: <Palette className="w-4 h-4" /> },
  // { name: "forest", label: "Forest", icon: <Palette className="w-4 h-4" /> },
  // { name: "aqua", label: "Aqua", icon: <Palette className="w-4 h-4" /> },
  // { name: "lofi", label: "Lo-Fi", icon: <Palette className="w-4 h-4" /> },
  // { name: "pastel", label: "Pastel", icon: <Palette className="w-4 h-4" /> },
  // { name: "fantasy", label: "Fantasy", icon: <Palette className="w-4 h-4" /> },
  // { name: "wireframe", label: "Wireframe", icon: <Palette className="w-4 h-4" /> },
  // { name: "black", label: "Black", icon: <Palette className="w-4 h-4" /> },
  // { name: "luxury", label: "Luxury", icon: <Palette className="w-4 h-4" /> },
  // { name: "dracula", label: "Dracula", icon: <Palette className="w-4 h-4" /> },
  // { name: "cmyk", label: "CMYK", icon: <Palette className="w-4 h-4" /> },
  // { name: "autumn", label: "Autumn", icon: <Palette className="w-4 h-4" /> },
  // { name: "business", label: "Business", icon: <Palette className="w-4 h-4" /> },
  // { name: "acid", label: "Acid", icon: <Palette className="w-4 h-4" /> },
  // { name: "lemonade", label: "Lemonade", icon: <Palette className="w-4 h-4" /> },
  // { name: "night", label: "Night", icon: <Palette className="w-4 h-4" /> },
  // { name: "coffee", label: "Coffee", icon: <Palette className="w-4 h-4" /> },
  // { name: "winter", label: "Winter", icon: <Palette className="w-4 h-4" /> },
];

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { updatePreference } = useUserPreferences();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as Theme);
    // Sauvegarder dans les préférences utilisateur
    updatePreference('theme', newTheme);
  };

  const getCurrentTheme = () => {
    return themes.find((t) => t.name === theme);
  };

  const currentTheme = getCurrentTheme();

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        {currentTheme?.icon || <Palette className="w-5 h-5" />}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64 max-h-80 overflow-y-auto"
      >
        <li className="menu-title">
          <span>Thèmes Personnalisés</span>
        </li>
        {themes.slice(0, 4).map((themeOption) => (
          <li key={themeOption.name}>
            <button
              onClick={() => handleThemeChange(themeOption.name)}
              className={`flex items-center gap-3 ${theme === themeOption.name ? "active" : ""}`}
            >
              {themeOption.icon}
              <span>{themeOption.label}</span>
              {theme === themeOption.name && (
                <div className="badge badge-primary badge-sm">Actuel</div>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
