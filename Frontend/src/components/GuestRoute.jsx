import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./UserContextObject";

const GuestRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  // If user is authenticated, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
