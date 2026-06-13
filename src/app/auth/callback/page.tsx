"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "../../store/StoreContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { loginWithToken } = useStore();

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      router.replace("/auth?error=" + (error ?? "oauth_failed"));
      return;
    }

    loginWithToken(token)
      .then(() => router.replace("/today"))
      .catch(() => router.replace("/auth?error=server_error"));
  }, [params, loginWithToken, router]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="vk-col" style={{ alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid var(--accent)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <span className="vk-muted vk-sm">Signing you in…</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
