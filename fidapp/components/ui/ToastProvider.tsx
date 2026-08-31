"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#091e14",
          color: "#f8faf9",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          borderRadius: "1rem",
          padding: "12px 18px",
          fontSize: "13px",
          fontWeight: 600,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "#091e14",
          },
        },
        error: {
          iconTheme: {
            primary: "#f43f5e",
            secondary: "#091e14",
          },
          style: {
            background: "#1e0b11",
            border: "1px solid rgba(244, 63, 94, 0.25)",
            color: "#fff1f2",
          },
        },
      }}
    />
  );
}
