import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo">
          <span className="site-header__mark">FQ</span>
          <span className="site-header__name">FinQuery</span>
        </Link>

        <nav className="site-header__nav">
          <a href="#value">Why</a>
          <a href="#how">How it works</a>
          <a href="#use-cases">Examples</a>
          <a href="#contact">Contact</a>
        </nav>

        <Link to="/app" className="btn btn-primary site-header__cta">
          Launch app
        </Link>
      </div>
    </header>
  );
}

export default Header;
