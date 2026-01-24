import LoginForm from "./_components/login-form";

type SearchParams = {
  verified?: string;
  reset?: string;
  signup?: string;
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const statusMessage =
    params?.verified === "1"
      ? "Email verified. You can sign in now."
      : params?.reset === "1"
        ? "Password updated. Sign in with your new password."
        : params?.signup === "1"
          ? "Account created. Check your email to verify."
          : undefined;

  return <LoginForm statusMessage={statusMessage} />;
}
