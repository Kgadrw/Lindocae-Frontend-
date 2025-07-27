"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const googleEmail = params.get("email");
      const googleUserId = params.get("user");
      const loginValue = googleEmail || googleUserId;
      if (loginValue) {
        localStorage.setItem("userEmail", loginValue);
        localStorage.setItem(
          `userName:${loginValue}`,
          loginValue.includes("@") ? loginValue.split("@")[0] : loginValue
        );
        window.dispatchEvent(new StorageEvent("storage", { key: "userEmail" }));
        window.location.replace("/"); // Full reload
      } else {
        // If nothing found, redirect to login
        router.replace("/login");
      }
    }
  }, [router]);

  return <div>Logging you in with Google...</div>;
} 