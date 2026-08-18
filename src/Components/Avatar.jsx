import { useState } from "react";

export default function Avatar({ avatarURL, name = "User", color = "var(--primary)", size = 32 }) {
  const [imgError, setImgError] = useState(false);

  const initials = (name || "U")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "U";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${color}18`,
        border: `1.5px solid ${color}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        fontWeight: 700,
        fontSize: Math.max(10, Math.floor(size * 0.38)),
        color: color,
        fontFamily: "'JetBrains Mono', monospace",
        userSelect: "none",
      }}
    >
      {avatarURL && !imgError ? (
        <img
          src={avatarURL}
          alt={name}
          onError={() => setImgError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}