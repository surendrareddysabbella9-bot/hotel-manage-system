import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/constants";

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleLoginButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // We don't have a direct google login method in context that takes token, 
  // so we'll just handle the JWT storage and reload here, or we can add it to context.
  // The simplest is to just store the token and reload so AuthContext picks it up.

  useEffect(() => {
    let isMounted = true;

    const initGoogleSignIn = async () => {
      try {
        const config = await apiFetch("/auth/config/google");
        
        if (config.client_id && containerRef.current && window.google) {
          window.google.accounts.id.initialize({
            client_id: config.client_id,
            callback: async (response: any) => {
              try {
                const res = await apiFetch("/auth/google", {
                  method: "POST",
                  body: JSON.stringify({ token: response.credential })
                });
                
                // Store token
                localStorage.setItem("token", res.token);
                // Redirect based on role
                const role = res.user.role;
                if (role === 'admin') navigate(ROUTES.admin.dashboard);
                else if (role === 'staff') navigate(ROUTES.staff.kitchen);
                else navigate(ROUTES.customer.home);
                
                // Force a reload to let AuthContext initialize with the new token
                window.location.reload();
              } catch (err: any) {
                setError(err.message || "Google login failed");
              }
            }
          });

          window.google.accounts.id.renderButton(containerRef.current, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with"
          });
        }
      } catch (err) {
        console.error("Failed to load Google config", err);
      }
    };

    // Wait for the script to load if it hasn't already
    const checkGoogle = setInterval(() => {
      if (window.google) {
        clearInterval(checkGoogle);
        if (isMounted) initGoogleSignIn();
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => clearInterval(checkGoogle), 5000);

    return () => {
      isMounted = false;
      clearInterval(checkGoogle);
    };
  }, [navigate]);

  return (
    <div className="w-full flex flex-col items-center">
      <div ref={containerRef} className="w-full flex justify-center h-[40px]"></div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
