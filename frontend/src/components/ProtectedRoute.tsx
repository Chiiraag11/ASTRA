import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }: any) => {
  const { user } = useAuth();

  // ❌ If not logged in → redirect
  if (!user) {
    return <Navigate to="/signin" />;
  }

  // ✅ If logged in → allow access
  return children;
};

export default ProtectedRoute;