import { ReactNode } from "react";

export type FormState =
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
      errors: {
        path: string;
        message: string;
      }[];
    };

export type PageProps<
  Params extends Record<string, unknown>,
  SearchParams extends Record<string, unknown> | undefined = undefined,
> = SearchParams extends undefined
  ? {
      params: Promise<Params>;
    }
  : {
      params: Promise<Params>;
      searchParams: Promise<SearchParams>;
    };

export type LayoutProps<Params extends Record<string, unknown>> = PageProps<Params> & {
  children: ReactNode;
};
