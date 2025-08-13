"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { setSessionForInvitedUser } from "../../actions";

export default function AcceptInvitePage() {
  const router = useRouter();
  useEffect(() => {
    const hash = window.location.hash.substring(1);

    if (!hash) {
      router.push("/");
    }

    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      (async () => {
        await setSessionForInvitedUser(accessToken, refreshToken);
      })();
    } else {
      router.push("/");
    }
  }, [router]);

  return null;
}
