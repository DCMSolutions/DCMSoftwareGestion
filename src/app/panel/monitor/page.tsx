import { api } from "~/trpc/server";
import { Card, CardTitle } from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";
import BoxContent from "~/components/box-content";
import { Zap, ZapOff } from "lucide-react";
import { Locker } from "~/server/api/routers/lockers";
import { tienePermiso } from "~/lib/permisos";
import { redirect } from "next/navigation";

export default async function Home() {
  const { perms } = await api.user.self.query();
  if (!tienePermiso(perms, "panel:monitor")) {
    redirect("/accessdenied");
    return <></>;
  }

  const { lockers, stores, reservas, sizes } = await fetchData();

  return (
    <section className="w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {lockers.map((locker) => {
            const store = stores.find(
              (store) => store.lockers.some(l => l.serieLocker === locker.nroSerieLocker),
            );

            return (
              <CarouselItem key={locker.id}>
                <Card>
                  <CardTitle>
                    <Header locker={locker} store={store} />
                  </CardTitle>
                  <BoxContent
                    locker={locker}
                    reservas={reservas}
                    sizes={sizes}
                  />
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

async function fetchData() {
  const [lockers, stores, reservas, sizes] = await Promise.all([
    api.locker.get.query(),
    api.store.get.query(),
    api.reserve.getLastReserveByBox.query(),
    api.size.getProt.query({ store: null }),
  ]);

  return {
    lockers: lockers as Locker[],
    stores,
    reservas,
    sizes,
  };
}

function Header({ locker, store }: { locker: Locker; store?: any }) {
  return (
    <div className="flex justify-between p-3">
      <div className="flex gap-4">
        <span>Locker: {locker.nroSerieLocker}</span>
        {locker.status === "connected" ? (
          <Zap size={18} color="green" />
        ) : (
          <ZapOff size={18} color="red" />
        )}
      </div>
      {store ? (
        <span>Local: {store.name}</span>
      ) : (
        <span className="text-xs text-red-400">No hay local asignado</span>
      )}
    </div>
  );
}
