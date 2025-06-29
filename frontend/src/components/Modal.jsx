import React from "react";

export const Modal = ({ show, onClose, title, message }) => {
  if (!show) return null;
  return (
    <div style={{
    
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      color : "#222"}}>

      <div style={{
        background: "#fff", 
        borderRadius: 10, 
        padding: 24, minWidth: 250, 
        boxShadow: "0 2px 16px rgba(0,0,0,0.12)", 
        position: "relative"}}>

        <button onClick={onClose} style={{
          position: "absolute", 
          top: 8, right: 8, 
          border: "none", 
          background: "none", 
          fontSize: 18, 
          cursor: "pointer"}}>×</button>

        <h3 style={{ margin: "0 0 8px 0" }}>{title}</h3>
        <p style={{ margin: "0 0 16px 0" }}>{message}</p>

        <button onClick={onClose} style={{
          background: "#222", 
          color: "#fff", 
          border: "none", 
          borderRadius: 6, 
          padding: "6px 18px", 
          cursor: "pointer"}}>Ok</button>
      </div>
    </div>
  );
};

