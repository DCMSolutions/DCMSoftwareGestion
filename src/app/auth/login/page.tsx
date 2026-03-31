import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();
  if (session) redirect("/panel");
  return (
    <Link
      href={session ? "/api/auth/signout" : "/api/auth/signin"}
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
    >
      {session ? "Sign out" : "Sign in"}
    </Link>
  );
}
