import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>Earthquake Support System</h2>
      <div>
        <Link to="/">Dashboard</Link>
        <Link to="/earthquake-analysis">Earthquake</Link>
        <Link to="/tweet-analysis">Tweets</Link>
        <Link to="/satellite-damage-analysis">Satellite</Link>
        <Link to="/integrated-report">Integrated Report</Link>
        <Link to="/history">History</Link>
      </div>
    </nav>
  );
}

export default Navbar;