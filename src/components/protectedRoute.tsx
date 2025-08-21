import { useAppSelector } from "@/redux/hooks";
import { Navigate, Outlet } from "react-router";

export const ProtectedRoute = () => {
  const { token } = useAppSelector((state) => state.auth);

  return token ? <Outlet /> : <Navigate to="/" replace />;
};
