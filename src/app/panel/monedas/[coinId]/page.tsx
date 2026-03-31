import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import CoinPage from "./coin-page";

export default async function Channel(props: { params: { coinId: string } }) {
  const coin = await api.coin.getById.query({
    id: props.params.coinId,
  });

  if (!coin) {
    return <Title>No se encontró la moneda</Title>;
  }

  return <CoinPage coin={coin} />;
}
