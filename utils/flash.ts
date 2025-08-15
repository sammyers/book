import { ToastProps } from "@heroui/toast";
import { cookies } from "next/headers";

type FlashMessageParams = Pick<ToastProps, "title" | "description" | "color">;

const FLASH_MESSAGE_COOKIE_NAME = "flashMessage";

export async function setFlashMessage(params: FlashMessageParams) {
  const cookieStore = await cookies();
  cookieStore.set(FLASH_MESSAGE_COOKIE_NAME, JSON.stringify(params), {
    path: "/",
    maxAge: 60,
  });
}
