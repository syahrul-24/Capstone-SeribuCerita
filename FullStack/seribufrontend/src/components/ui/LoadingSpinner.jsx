export default function LoadingSpinner({ size = 24, color = "#415f83" }) {
  return (
    <div style={{
      width: size, height: size, border: `2.5px solid ${color}20`,
      borderTop: `2.5px solid ${color}`, borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function PageLoader({ message = "Memuat..." }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#F8FAFF", gap: 16,
    }}>
      <LoadingSpinner size={36} />
      <p style={{ fontSize: 14, color: "#A8B4C8", fontFamily: "'Nunito',sans-serif", fontWeight: 500 }}>
        {message}
      </p>
    </div>
  );
}
