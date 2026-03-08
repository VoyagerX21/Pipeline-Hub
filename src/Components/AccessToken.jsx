import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function OAuthSuccess({ onLogin }) {

  const navigate = useNavigate();
  const location = useLocation();

  useEffect( async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include'
    });
    const data = await res.json();
    console.log(data)
    if (data.success){
        navigate("/events");
    }
    else{
        navigate("/login");
    }
  }, []);

  return <div>Logging you in...</div>;
}

export default OAuthSuccess;