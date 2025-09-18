import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import Login from './pages/Login.tsx';
import Topics from "./pages/Topics.tsx";
import type { JSX } from "react";
import Transfer from "./pages/Transfer.tsx";
import Settings from "./pages/Settings.tsx";
import { Profile, doLogout } from "./services/Web3Service.ts";

function Router() {

    type Props = {
        children: JSX.Element;
    }
    function PrivateRoute({ children }: Props) {

        const isAuth = localStorage.getItem("account") !== null;

        return isAuth ? children : <Navigate to="/" replace />;
    }

    function CouncilRoute({ children }: Props) {

        const isAuth = localStorage.getItem("account") !== null;
        const isResident = parseInt(localStorage.getItem("profile") || "0") == Profile.RESIDENT;

        if (isAuth && !isResident) {
            return children;
        } else {
            doLogout();
            return <Navigate to="/" replace />;
        }
    }

    function ResidentRoute({ children }: Props) {

        const isAuth = localStorage.getItem("account") !== null;
        const isResident = parseInt(localStorage.getItem("profile") || "0") == Profile.RESIDENT;

        if (isAuth && isResident) {
            return children;
        } else {
            doLogout();
            return <Navigate to="/" replace />;
        }
    }

    function ManagerRoute({ children }: Props) {

        const isAuth = localStorage.getItem("account") !== null;
        const isManager = parseInt(localStorage.getItem("profile") || "0") == Profile.MANAGER;

        if (isAuth && isManager) {
            return children;
        } else {
            doLogout();
            return <Navigate to="/" replace />;
        }
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                <Route path="/topics" element={
                    <PrivateRoute>
                        <Topics />
                    </PrivateRoute>}
                />
                <Route path="/transfer" element={
                    <ManagerRoute>
                        <Transfer />
                    </ManagerRoute>
                }

                />

                <Route path="/settings" element={
                    <ManagerRoute>
                        <Settings />
                    </ManagerRoute>
                }
                />

            </Routes>
        </BrowserRouter>
    )
}

export default Router;