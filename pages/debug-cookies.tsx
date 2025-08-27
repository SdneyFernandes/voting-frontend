import { getCookie } from "@/utils/cookies";
import { useEffect } from "react";

// pages/debug-cookies.tsx
export default function DebugCookies() {
  useEffect(() => {
    console.log('🍪 [Debug] Todos cookies:', document.cookie);
    console.log('🍪 [Debug] userId:', getCookie('userId'));
    console.log('🍪 [Debug] role:', getCookie('role'));
  }, []);

  return (
    <div>
      <h1>Debug Cookies</h1>
      <p>Check console for cookie details</p>
      <button onClick={() => window.location.reload()}>Refresh</button>
    </div>
  );
}