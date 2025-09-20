import React from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  DashboardIcon,
  ScissorsIcon,
  SettingsIcon,
  LogoutIcon,
  HomeIcon,
} from "../../components/icons";

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 p-3 rounded-lg transition duration-200 ${
      isActive ? "bg-brand-gold text-brand-dark" : "hover:bg-brand-light-dark"
    }`;

  return (
    <div className="min-h-screen flex bg-brand-light-dark">
      <aside className="w-64 bg-brand-dark p-4 flex flex-col">
        <div
          className="text-2xl font-bold text-brand-gold mb-10 text-center"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Admin Panel
        </div>
        <nav className="flex-grow space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-3 p-3 rounded-lg transition duration-200 hover:bg-brand-light-dark border-b border-brand-light-dark mb-2"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Ver a Home</span>
          </Link>
          <NavLink to="/admin/dashboard" className={navLinkClasses}>
            <DashboardIcon className="w-5 h-5" />
            <span>Agendamentos</span>
          </NavLink>
          <NavLink to="/admin/servicos" className={navLinkClasses}>
            <ScissorsIcon className="w-5 h-5" />
            <span>Serviços</span>
          </NavLink>
          <NavLink to="/admin/configuracoes" className={navLinkClasses}>
            <SettingsIcon className="w-5 h-5" />
            <span>Configurações</span>
          </NavLink>
        </nav>
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg w-full text-left hover:bg-brand-light-dark"
          >
            <LogoutIcon className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
