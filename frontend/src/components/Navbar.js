import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar({ user, onLogout }) {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  if (hideNavbar) return null;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          EduVerse
        </Link>
      </div>
      <div className="navbar-center">
        <Link to="/">Home</Link>
        <Link to="/subjects">Subjects</Link>
        <Link to="/library">Library</Link>
        <Link to="/progress">Progress</Link>
      </div>
      <div className="navbar-right">
        {user && <span className="username">{user.displayName || user.email}</span>}
        {user && (
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
