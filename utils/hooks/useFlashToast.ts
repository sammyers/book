"use client";

import { addToast } from "@heroui/toast";
import { useEffect } from "react";

import { getCookie } from "../cookies";

const FLASH_MESSAGE_COOKIE_NAME = "flashMessage";

export function useFlashToast() {
  useEffect(() => {
    const flashCookie = getCookie(FLASH_MESSAGE_COOKIE_NAME);

    if (flashCookie) {
      try {
        const flashMessage = JSON.parse(decodeURIComponent(flashCookie));
        addToast(flashMessage);
      } catch (error) {
        console.warn(error);
      }

      document.cookie = `${FLASH_MESSAGE_COOKIE_NAME}=; path=/; max-age=0`;
    }
  }, []);
}
