// src/components/PageLoader.tsx
import React from "react";

interface PageLoaderProps {
  page?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ page = "página" }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#000000",
        color: "#ff6b35",
        fontSize: "18px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          marginBottom: "20px",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        InteliMark
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            border: "2px solid #ff6b35",
            borderTop: "2px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        Cargando {page}...
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default PageLoader;
