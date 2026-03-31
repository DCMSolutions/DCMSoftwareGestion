import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import CuponPage from "./cupon-page";

export default async function Channel(props: { params: { cuponId: string } }) {
  const cupon = await api.cupones.getById.query({
    cuponId: props.params.cuponId,
  });
  if (!cupon) {
    return <Title>No se encontró el cupón</Title>;
  }

  return <CuponPage cupon={cupon} />;
}
