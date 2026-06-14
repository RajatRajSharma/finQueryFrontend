import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__mark">FQ</span>
          <span>FinQuery</span>
        </div>
        <p className="site-footer__note">
          Chat with annual reports, grounded in the source documents.
        </p>
        <nav className="site-footer__links">
          <a href="#value">Why</a>
          <a href="#how">How it works</a>
          <a href="#use-cases">Examples</a>
          <a href="#contact">Contact</a>
        </nav>

        <p className="site-footer__credit">
          FinQuery by Rajat Raj Sharma · © 2026
        </p>
      </div>
    </footer>
  );
}

export default Footer;
