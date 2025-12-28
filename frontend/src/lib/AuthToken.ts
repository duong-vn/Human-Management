import { jwtDecode } from "jwt-decode";
export type User = {
  _id: string;
  username: string;
  role: string;
} | null;

type AuthListener = () => void;
const listeners = new Set<AuthListener>();

const notifyAuth = () => {
  for (const listener of listeners) listener();
};

export const subscribeAuth = (listener: AuthListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

let user: User = null;

export const setUserFromToken = (token: string) => {
  const decoded: {
    username: string;
    sub: string;
    role: string;
  } = jwtDecode(token);
  user = {
    _id: decoded.sub,
    username: decoded.username,
    role: decoded.role,
  };
  notifyAuth();
};

export const getUser = () => user;

export const clearUser = () => {
  user = null;
  notifyAuth();
};
let _at: string | null = null;
export const setAT = (t: string | null) => {
  _at = t;
  notifyAuth();
};
export const getAT = () => _at;
