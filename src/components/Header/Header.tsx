import "./Header.css";

function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a href="/" className="site-header__logo">
          <span className="site-header__mark">FQ</span>
          <span className="site-header__name">FinQuery</span>
        </a>

        <nav className="site-header__nav">
          <a href="#value">Why</a>
          <a href="#how">How it works</a>
          <a href="#use-cases">Examples</a>
          <a href="#contact">Contact</a>
        </nav>

        <a href="/app" className="btn btn-primary site-header__cta">
          Launch app
        </a>
      </div>
    </header>
  );
}

export default Header;
