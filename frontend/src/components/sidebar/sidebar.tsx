import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./sidebar.css";

interface User {
  name: string;
  email: string;
}

interface SidebarProps {
  user?: User;
  onLogout: () => void;
  openSidebar?: boolean;
  toggleSidebar?: () => void; // no mobile, passe uma função que FECHA
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  onLogout,
  openSidebar = false,
  toggleSidebar,
}) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ✅ trava o scroll do body quando a sidebar estiver aberta no mobile
  useEffect(() => {
    if (!isMobile) return;

    if (openSidebar) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobile, openSidebar]);

  const closeMobile = () => {
    if (isMobile) toggleSidebar?.(); // no dashboard, passe closeSidebar aqui
  };

  return (
    <>
      {/* Backdrop */}
      {isMobile && (
        <div
          className={`sidebar-backdrop ${openSidebar ? "open" : ""}`}
          onClick={openSidebar ? closeMobile : undefined}
        />
      )}

      <aside className={`dashboard-sidebar ${openSidebar ? "active" : ""}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">ProTsK Manager</h1>
        </div>

        <div
          className={`sidebar-main ${isMobile ? (openSidebar ? "expanded" : "collapsed") : ""}`}
        >
          <nav className="sidebar-nav">
            <Link
              to="/dashboard"
              className="projects-link"
              onClick={closeMobile}
            >
              Home
            </Link>
            <Link
              to="/projects"
              className="projects-link"
              onClick={closeMobile}
            >
              Projetos
            </Link>
          </nav>
        </div>

        {user && (openSidebar || !isMobile) && (
          <div
            className={`sidebar-footer ${isMobile && openSidebar ? "expanded" : ""}`}
          >
            <div className="sidebar-user">
              <p className="user-name">{user.name}</p>
              <p className="user-email">{user.email}</p>
            </div>

            <div className="sidebar-buttons">
              <button onClick={onLogout}>Deslogar</button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
