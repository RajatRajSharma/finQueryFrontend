import { Link, NavLink } from "react-router-dom";
import "./AppHeader.css";

function tabClass({ isActive }: { isActive: boolean }) {
  return "app-header__tab" + (isActive ? " app-header__tab--active" : "");
}

function AppHeader() {
  return (
    <header className="app-header">
      <Link to="/" className="app-header__logo">
        <span className="app-header__mark">FQ</span>
        <span className="app-header__name">FinQuery</span>
      </Link>

      {/* toggle between Chat and Evaluation */}
      <nav className="app-header__nav">
        <NavLink to="/app" end className={tabClass}>
          Chat
        </NavLink>
        <NavLink to="/app/evaluation" className={tabClass}>
          Evaluation
        </NavLink>
      </nav>

      <Link to="/" className="app-header__back">
        ← Back to home
      </Link>
    </header>
  );
}

export default AppHeader;
