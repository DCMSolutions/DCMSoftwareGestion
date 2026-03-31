import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import StorePage from "./store-page";

export default async function Channel(props: { params: { storeId: string } }) {
  const store = await api.store.getById.query({
    storeId: props.params.storeId,
  });
  const cities = await api.city.get.query();
  const lockersResponse = await api.locker.get.query();
  const coin = await api.coin.get.query();
  const sizes = await api.size.getProt.query({
    store: store?.identifier ?? null,
  });

  const fees = await api.fee.getByStoreProt.query({
    id: props.params.storeId
  });

  if ("error" in lockersResponse) {
    return <Title>Error: {lockersResponse.error}</Title>;
  }

  if (!store) {
    return <Title>No se encontró el local</Title>;
  }

  return <StorePage store={store} cities={cities} lockers={lockersResponse} coins={coin} sizes={sizes} fees={fees} />;
}
