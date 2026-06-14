import { Link } from "react-router-dom";
import "./AppHeader.css";

function AppHeader() {
  return (
    <header className="app-header">
      <Link to="/" className="app-header__logo">
        <span className="app-header__mark">FQ</span>
        <span className="app-header__name">FinQuery</span>
      </Link>

      {/* toggle between Chat and Evaluation (eval page not built yet) */}
      <nav className="app-header__nav">
        <span className="app-header__tab app-header__tab--active">Chat</span>
        <span
          className="app-header__tab app-header__tab--disabled"
          title="Coming soon"
        >
          Evaluation
        </span>
      </nav>

      <Link to="/" className="app-header__back">
        ← Back to home
      </Link>
    </header>
  );
}

export default AppHeader;
