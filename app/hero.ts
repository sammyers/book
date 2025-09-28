import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        default: {
          // Same as default-50
          75: "#fafafa",
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    },
    dark: {
      colors: {
        background: "#161619",
        default: {
          75: "#202024",
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    },
  },
});
