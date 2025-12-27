import { jwtDecode } from "jwt-decode";
export type User = {
  _id: string;
  username: string;
  role: string;
} | null;

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
};

export const getUser = () => user;

export const clearUser = () => {
  user = null;
};
let _at: string | null = null;
export const setAT = (t: string | null) => {
  _at = t;
};
export const getAT = () => _at;
