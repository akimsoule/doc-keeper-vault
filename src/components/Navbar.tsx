import React from "react";
import { LogOut, User, Moon, Sun, FileText } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface NavbarProps {
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleTheme, isDarkMode }) => {
  const { state, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="navbar bg-base-100 shadow-lg border-b border-base-300">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <FileText className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold">Doc Keeper</span>
        </div>
      </div>

      <div className="flex-none">
        <div className="flex items-center gap-2">
          {/* Toggle theme */}
          <button
            className="btn btn-ghost btn-circle"
            onClick={onToggleTheme}
            title={isDarkMode ? "Mode clair" : "Mode sombre"}
          >
            {isDarkMode ? (
              <Sun className="w-7 h-7" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* User menu */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle flex items-center justify-center"
            >
              <User className="w-5 h-5 text-primary" />
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-0 shadow-lg bg-base-100 rounded-box w-64 border border-base-300"
            >
              {/* Header utilisateur */}
              <li className="p-4 border-b border-base-300">
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-start">
                    <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-base-content">
                      {state.user?.name}
                    </span>
                    <span className="text-xs text-base-content/60">
                      {state.user?.email}
                    </span>
                  </div>
                </div>
              </li>
              
              {/* Actions */}
              <li className="p-2">
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-3 px-3 py-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
