"use client";

import { ChevronLeftCircle } from "lucide-react";
import ButtonIconCustomComponent from "~/components/button-icon-custom";
import { Title } from "~/components/title";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Store } from "~/server/api/routers/store";
import type { Translations } from "~/translations";

export default function StoreSelector({ t, ...props }: {
  stores: Store[] | undefined;
  store: Store | null;
  setStore: (store: Store) => void;
  goBack: () => void;
  t: Translations,
}) {
  if (!props.stores || props.stores.length === 0) {
    return <div>
      <div className="flex flex-row">
        <ButtonIconCustomComponent className="mx-4" noWFull={true} icon={<ChevronLeftCircle />} onClick={props.goBack} />
        <h2 className="text-3xl font-semibold">
          <Title>{t("noStores")}</Title>
        </h2>
      </div>
    </div>;
  } else {
    return (
      <main className="flex justify-center sm:p-4 md:p-6 lg:p-8">
        {!props.store && (
          <div className="container flex flex-col items-center justify-center gap-4 sm:gap-6">
            <div className="flex flex-row">
              <ButtonIconCustomComponent className="mx-4" noWFull={true} icon={<ChevronLeftCircle />} onClick={props.goBack} />
              <h2 className="text-3xl font-semibold">
                {t("chooseStore")}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {props.stores.map((store) => {
                const key =
                  store.identifier ?? store.identifier ?? Math.random();
                return (
                  <Card
                    className="w-full max-w-xs cursor-pointer overflow-hidden p-0 shadow-xl"
                    onClick={() => {
                      props.setStore(store);
                    }}
                    key={store.identifier}
                  >
                    <CardHeader className="p-2">
                      <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl">
                        {store.name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {store.address}
                        <br />
                        {store.description}
                      </CardDescription>
                    </CardHeader>
                    <img
                      className="aspect-video w-full object-cover"
                      src={store.image ? store.image : "/placeholder.svg"}
                      alt={`Image of ${store.name}`}
                    />
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    );
  }
}
