import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { UserContext } from "./UserContextObject";
const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }
  return (
    <nav className="navbar">
      <h1>Hotel Booking</h1>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/all-rooms">All Rooms</Link>
        </li>
        {user == null ? null : (
          <li>
            <Link to="/my-bookings">My Bookings</Link>
          </li>
        )}
        {user == null ? (
          <li>
            <Link to="/auth">Login</Link>
          </li>
        ) : (
          <li className="logout" onClick={handleLogout}>
            Logout
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
