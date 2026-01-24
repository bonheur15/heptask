import { cookies } from "next/headers";

const splitSetCookieHeader = (value: string) => {
  const parts: string[] = [];
  let start = 0;
  let inExpires = false;
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (!inExpires && value.slice(i, i + 8).toLowerCase() === "expires=") {
      inExpires = true;
      i += 7;
      continue;
    }
    if (inExpires && char === ";") {
      inExpires = false;
      continue;
    }
    if (char === "," && !inExpires) {
      const part = value.slice(start, i).trim();
      if (part) parts.push(part);
      start = i + 1;
    }
  }
  const last = value.slice(start).trim();
  if (last) parts.push(last);
  return parts;
};

const parseSetCookie = (cookie: string) => {
  const [nameValue, ...attributes] = cookie.split(";");
  const [name, ...valueParts] = nameValue.split("=");
  const value = valueParts.join("=");
  const options: Record<string, unknown> = {};
  for (const attribute of attributes) {
    const [rawKey, ...rawValueParts] = attribute.trim().split("=");
    const key = rawKey.toLowerCase();
    const rawValue = rawValueParts.join("=");
    if (key === "path") options.path = rawValue || "/";
    else if (key === "domain") options.domain = rawValue;
    else if (key === "max-age") options.maxAge = Number(rawValue);
    else if (key === "expires") options.expires = new Date(rawValue);
    else if (key === "samesite") options.sameSite = rawValue.toLowerCase();
    else if (key === "secure") options.secure = true;
    else if (key === "httponly") options.httpOnly = true;
  }
  return { name: name.trim(), value, options };
};

export const applySetCookie = async (headers?: Headers | null) => {
  if (!headers) return;
  const store = await cookies();
  const setCookieValues =
    typeof (headers as Headers & { getSetCookie?: () => string[] })
      .getSetCookie === "function"
      ? (headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
      : null;
  const rawCookies =
    setCookieValues && setCookieValues.length
      ? setCookieValues
      : (headers.get("set-cookie")
          ? splitSetCookieHeader(headers.get("set-cookie") || "")
          : []);
  if (!rawCookies.length) return;
  for (const cookie of rawCookies) {
    const parsed = parseSetCookie(cookie);
    if (parsed.name) store.set(parsed.name, parsed.value, parsed.options);
  }
};
