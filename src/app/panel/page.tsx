import { SignIn } from "@clerk/nextjs";
import { Title } from "~/components/title";

export default async function Home() {
  return (
    <section className="space-y-2">
      <Title>Bienvenido.</Title>
    </section>
  );
}
