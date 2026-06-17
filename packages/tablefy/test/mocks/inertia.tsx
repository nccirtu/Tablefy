// Mock of `@inertiajs/react` for tests.
import React from "react";

export const router = {
  visit: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  reload: jest.fn(),
};

export function useForm(initial: any) {
  const [data, setData] = React.useState(initial);
  return {
    data,
    setData: (key: any, value?: any) =>
      typeof key === "object"
        ? setData(key)
        : setData((d: any) => ({ ...d, [key]: value })),
    errors: {},
    processing: false,
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    reset: jest.fn(),
    transform: jest.fn(),
  };
}

// Controllable page props for usePage() in tests.
let __pageProps: Record<string, any> = {};
export function __setPageProps(props: Record<string, any>) {
  __pageProps = props;
}
export function usePage() {
  return { props: __pageProps, url: "/", component: "Test" };
}

export const Head = ({ children }: any) =>
  React.createElement(React.Fragment, null, children);

export const Link = ({ children, ...props }: any) =>
  React.createElement("a", props, children);
