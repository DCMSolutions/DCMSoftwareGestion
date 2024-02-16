import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import StorePage from "./store-page";

export default async function Channel(props: { params: { sizeId: string } }) {
  const size = await api.size.getById.query({
    sizeId: parseInt(props.params.sizeId),
  });
  const cities = await api.city.get.query();
  const lockers = await api.locker.get.query();
  if (!size) {
    return <Title>No se encontró el tamaño</Title>;
  }
  return <Title>{size.nombre}</Title>;

  //   return <StorePage store={store} cities={cities} lockers={lockers} />;
}
