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

export default async function Home() {
  const [lockers, stores, reservas] = await Promise.all([
    api.locker.get.query(),
    api.store.get.query(),
    api.reserve.getLastReserveByBox.query(),
  ]);

  return (
    <section className="w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {(lockers as Locker[]).map((locker, index) => {
            const store = stores.find(
              (store) => store.serieLocker === locker.nroSerieLocker,
            );

            return (
              <CarouselItem key={locker.id || index}>
                <Card>
                  <CardTitle>
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
                        <span className="text-xs text-red-400">
                          No hay local asignado
                        </span>
                      )}
                    </div>
                  </CardTitle>
                  <BoxContent locker={locker} reservas={reservas} />
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
