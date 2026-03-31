"use client"

import { useTranslations } from "next-intl"
import { Reserve } from "~/server/api/routers/lockerReserveRouter";
import { Size } from "~/server/api/routers/sizes";
import { StoreSimple } from "~/server/api/routers/store";
import Success from "../_components/success/success";

export function PageClient(props: {
  reserves: Reserve[];
  store: StoreSimple;
  nReserve: number;
  total: number;
  coin?: { description?: string | null };
  checkoutNumber: string;
  sizes: Size[];
  startDate: string | undefined;
  endDate: string | undefined;
}) {
  const t = useTranslations("HomePage");
  return <div className="flex w-[100vw] h-[100vh] items-center justify-center">
    <Success
      checkoutNumber={props.checkoutNumber}
      endDate={props.endDate}
      nReserve={props.nReserve}
      reserves={props.reserves}
      sizes={props.sizes}
      startDate={props.startDate}
      store={props.store}
      t={t}
      total={props.total}
      coin={props.coin}
    />
  </div>
}