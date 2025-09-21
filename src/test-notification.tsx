import { NotificationManager } from "./utils/notifications";

export const TestNotification = () => {
  const handleTest = () => {
    // eslint-disable-next-line no-console
    console.log("Ejecutando notificación de prueba...");
    NotificationManager.vapiDisconnected();
  };

  return (
    <button
      onClick={handleTest}
      style={{
        position: "fixed",
        top: "100px",
        right: "20px",
        background: "#da8023",
        color: "white",
        padding: "10px",
        border: "none",
        borderRadius: "5px",
        zIndex: 10000,
        cursor: "pointer",
      }}
    >
      PROBAR NOTIFICACIÓN
    </button>
  );
};
