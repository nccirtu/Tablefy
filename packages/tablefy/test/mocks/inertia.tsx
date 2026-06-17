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
  const transformRef = React.useRef((d: any) => d);
  const submit = () => {
    __lastSubmit = transformRef.current(data);
  };
  return {
    data,
    setData: (key: any, value?: any) =>
      typeof key === "object"
        ? setData(key)
        : setData((d: any) => ({ ...d, [key]: value })),
    errors: {},
    processing: false,
    post: jest.fn(submit),
    put: jest.fn(submit),
    patch: jest.fn(submit),
    delete: jest.fn(submit),
    reset: jest.fn(),
    transform: (cb: any) => {
      transformRef.current = cb;
    },
  };
}

// Captures the payload of the most recent submit (after `transform`).
let __lastSubmit: any = null;
export function __getLastSubmit() {
  return __lastSubmit;
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
