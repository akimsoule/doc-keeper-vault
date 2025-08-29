import React from "react";
import { useTheme } from "../hooks/useTheme";

const themes = [
  { name: "light", label: "Clair" },
  { name: "dark", label: "Sombre" },
  { name: "cupcake", label: "Cupcake" },
  { name: "bumblebee", label: "Bumblebee" },
  { name: "emerald", label: "Emerald" },
  { name: "corporate", label: "Corporate" },
  { name: "synthwave", label: "Synthwave" },
  { name: "retro", label: "Retro" },
  { name: "cyberpunk", label: "Cyberpunk" },
  { name: "valentine", label: "Valentine" },
  { name: "halloween", label: "Halloween" },
  { name: "garden", label: "Garden" },
  { name: "forest", label: "Forest" },
  { name: "aqua", label: "Aqua" },
  { name: "lofi", label: "Lo-Fi" },
  { name: "pastel", label: "Pastel" },
  { name: "fantasy", label: "Fantasy" },
  { name: "wireframe", label: "Wireframe" },
  { name: "black", label: "Black" },
  { name: "luxury", label: "Luxury" },
  { name: "dracula", label: "Dracula" },
  { name: "cmyk", label: "CMYK" },
  { name: "autumn", label: "Autumn" },
  { name: "business", label: "Business" },
  { name: "acid", label: "Acid" },
  { name: "lemonade", label: "Lemonade" },
  { name: "night", label: "Night" },
  { name: "coffee", label: "Coffee" },
  { name: "winter", label: "Winter" },
];

export const ThemeSelector: React.FC = () => {
  const { theme, setSpecificTheme } = useTheme();

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
        Thème: {themes.find((t) => t.name === theme)?.label || theme}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto"
      >
        {themes.map((themeOption) => (
          <li key={themeOption.name}>
            <a
              onClick={() => setSpecificTheme(themeOption.name)}
              className={theme === themeOption.name ? "active" : ""}
            >
              {themeOption.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
