import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TravelModeRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Dispatch event to open Travel Mode modal
    window.dispatchEvent(new CustomEvent("openTravelModeModal"));
    
    // Navigate to home
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
};

export default TravelModeRedirect;