import React from "react";
import { useContext } from "react";
import AuthContext from "../AuthContext";
import { Navigate } from "react-router-dom";


export const Dashboard = () => {
    const { user } = useContext(AuthContext);
    if (!user) {
    return <Navigate to ="/login" replace/>
    }

    return (
        <div>
            <h2>Dashboard</h2>
            {user && <p>Welcome, {user.username}!</p>}
            <button>Logout</button>
            
        </div>
    );
};
