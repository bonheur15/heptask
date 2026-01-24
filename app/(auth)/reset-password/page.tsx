import ResetPasswordForm from "./_components/reset-password-form";

type SearchParams = {
  token?: string;
  error?: string;
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const token = params?.token || "";
  const error = params?.error || (!token ? "missing_token" : undefined);

  return <ResetPasswordForm token={token} error={error} />;
}
