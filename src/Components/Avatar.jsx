export default function Avatar({ avatarURL, color = "#3b82f6", size = 32 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${color}22`,
        border: `1.5px solid ${color}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden"   // ⭐ important
      }}
    >
      <img
        src={avatarURL}
        alt="avatar"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",   // ⭐ keeps aspect ratio
        }}
      />
    </div>
  );
}