export const getBaseUrl = () =>
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

export const getAppOrigin = () => new URL(getBaseUrl()).origin;
