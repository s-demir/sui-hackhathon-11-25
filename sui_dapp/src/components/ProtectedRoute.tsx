import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const account = useCurrentAccount();

  if (!account) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
