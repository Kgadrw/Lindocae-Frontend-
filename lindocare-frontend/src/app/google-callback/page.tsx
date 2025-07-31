"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      
      // Debug: Log all parameters to see what we're getting
      console.log("Google callback parameters:", Object.fromEntries(params.entries()));
      
      // Check if we have a JSON response in the URL hash or body
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      
      let userData = null;
      
      // Try to parse JSON from URL hash
      if (hash && hash.startsWith('#/')) {
        try {
          const jsonStr = decodeURIComponent(hash.substring(2));
          userData = JSON.parse(jsonStr);
          console.log("Found JSON data in hash:", userData);
        } catch (e) {
          console.log("No valid JSON in hash");
        }
      }
      
      // If we have JSON data, use it
      if (userData) {
        const userEmail = userData.email || userData._id;
        const userName = userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}`
          : userData.firstName || userData.name || (userEmail && userEmail.includes("@") ? userEmail.split("@")[0] : userEmail);
        const userAvatar = userData.image && userData.image.length > 0 ? userData.image[0] : userData.avatar;
        
        console.log("Extracted user data from JSON:", { userEmail, userName, userAvatar });
        
        if (userEmail) {
          localStorage.setItem("userEmail", userEmail);
          
          if (userName && userName !== userEmail) {
            localStorage.setItem(`userName:${userEmail}`, userName);
            console.log("Stored userName:", userName);
          }
          
          if (userAvatar) {
            localStorage.setItem(`userAvatar:${userEmail}`, userAvatar);
            console.log("Stored userAvatar:", userAvatar);
          }
          
          window.dispatchEvent(new StorageEvent("storage", { key: "userEmail" }));
          window.dispatchEvent(new CustomEvent("userLogin", { 
            detail: { email: userEmail, name: userName, avatar: userAvatar } 
          }));
          
          setTimeout(() => {
            window.location.replace("/");
          }, 100);
          return;
        }
      }
      
      // Fallback to URL parameters (existing logic)
      const googleEmail = params.get("email");
      const googleName = params.get("name");
      const googleUserId = params.get("user");
      const googleAvatar = params.get("avatar");
      const googleDisplayName = params.get("displayName");
      const googleGivenName = params.get("givenName");
      const googleFamilyName = params.get("familyName");
      
      const userEmail = googleEmail || googleUserId;
      const userName = googleName || googleDisplayName || 
                     (googleGivenName && googleFamilyName ? `${googleGivenName} ${googleFamilyName}` : null) ||
                     googleGivenName || 
                     (userEmail && userEmail.includes("@") ? userEmail.split("@")[0] : userEmail);
      
      console.log("Extracted user data from URL params:", { userEmail, userName, googleAvatar });
      
      if (userEmail) {
        localStorage.setItem("userEmail", userEmail);
        
        if (userName && userName !== userEmail) {
          localStorage.setItem(`userName:${userEmail}`, userName);
          console.log("Stored userName:", userName);
        }
        
        if (googleAvatar) {
          localStorage.setItem(`userAvatar:${userEmail}`, googleAvatar);
          console.log("Stored userAvatar:", googleAvatar);
        }
        
        window.dispatchEvent(new StorageEvent("storage", { key: "userEmail" }));
        window.dispatchEvent(new CustomEvent("userLogin", { 
          detail: { email: userEmail, name: userName, avatar: googleAvatar } 
        }));
        
        setTimeout(() => {
          window.location.replace("/");
        }, 100);
      } else {
        router.replace("/login");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/lindo.png" alt="Lindo Logo" className="h-12 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Logging you in with Google...
        </h2>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
} 