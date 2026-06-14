import { Link } from "react-router-dom";
import "./Logo.css";

interface Props {
  /** if provided, the logo becomes a link to this route */
  to?: string;
  /** mark size — "md" for headers, "sm" for the footer */
  size?: "sm" | "md";
}

/**
 * The FinQuery brand mark + wordmark.
 * Shared across the marketing header, the app header and the footer.
 */
function Logo({ to, size = "md" }: Props) {
  const inner = (
    <>
      <span className={`logo__mark logo__mark--${size}`}>FQ</span>
      <span className="logo__name">FinQuery</span>
    </>
  );

  return to ? (
    <Link to={to} className="logo">
      {inner}
    </Link>
  ) : (
    <span className="logo">{inner}</span>
  );
}

export default Logo;
