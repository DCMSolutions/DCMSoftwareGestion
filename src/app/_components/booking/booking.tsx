"use client";
import { Store } from "~/server/api/routers/store";
import { es } from "date-fns/locale";
import { Reserve } from "~/server/api/routers/lockerReserveRouter";
import { Size } from "~/server/api/routers/sizes";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import { Fee } from "~/server/api/routers/fee";
import { Coin } from "~/server/api/routers/coin";
import { format } from "date-fns";
interface GroupedItem {
  IdSize: number;
  Cantidad: number;
  Days?: number;
  FirstDayTotal?: number;
  RestDaysTotal?: number;
  Total?: number;
  Fee: Fee;
}
export default function Booking(props: {
  store: Store;
  startDate: string;
  endDate: string;
  reserves: Reserve[];
  total: number;
  coin: Coin;
  setCoin: (coin: Coin) => void;
  coins: Coin[];
  sizes: Size[];
}) {
  const fees = api.fee.get.useQuery();

  const [subTotal, setSubTotal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [groupedItems, setGroupedItems] = useState<GroupedItem[]>();

  useEffect(() => {
    const grouped = props.reserves.reduce((acc, item) => {
      if (item.Cantidad === 1) {
        const existing = acc.find((group) => group.IdSize === item.IdSize);
        const days = daysBetweenDates(item.FechaInicio!, item.FechaFin!);
        const fee = fees.data!.find((f: Fee) => f.size == item.IdSize)!;
        const coin = props.coins.find((c: Coin) => c.identifier == fee.coin)!;
        props.setCoin(coin);

        if (existing) {
          existing.Cantidad += item.Cantidad;
        } else {
          acc.push({
            IdSize: item.IdSize!,
            Cantidad: item.Cantidad,
            Days: days,
            Fee: fee,
            FirstDayTotal: fee.value!,
            RestDaysTotal:
              ((days - 1) * fee.value! * (100 - fee.discount!)) / 100,
          });
        }
      }
      return acc;
    }, [] as GroupedItem[]);

    const updatedItems = grouped!.map((item) => {
      const updatedFirstDayTotal = item.FirstDayTotal! * item.Cantidad;
      const updatedRestDaysTotal = item.RestDaysTotal! * item.Cantidad;
      const updatedTotal = updatedFirstDayTotal + updatedRestDaysTotal;
      return {
        ...item,
        Total: updatedTotal,
        FirstDayTotal: updatedFirstDayTotal,
        RestDaysTotal: updatedRestDaysTotal,
      };
    });

    const newTotal = updatedItems.reduce((acc, item) => acc + item.Total, 0);
    setTotal(newTotal);
    setSubTotal(newTotal);
    setGroupedItems(updatedItems);
  }, []);

  function daysBetweenDates(date1: string, date2: string): number {
    const startDate = new Date(date1);
    const endDate = new Date(date2);

    const differenceInTime = endDate.getTime() - startDate.getTime();

    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return Math.round(differenceInDays);
  }
  function formatDateToTextDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = format(date, "eee dd MMMM", { locale: es });
    return formattedDate;
  }
  return (
    <>
      {groupedItems && (
        <div className="w-96 overflow-hidden rounded-3xl bg-white shadow-md">
          <div className="bg-[#848484] px-6 pb-1 pt-3">
            <p className="text-lg font-bold text-white">Tu reserva</p>
          </div>
          <div className="flex items-baseline justify-between bg-gray-100 px-6 py-4">
            <p className=" text-2xl font-bold text-orange-500">
              {props.store.name}
            </p>
            <p className=" text-xs font-bold text-orange-500">
              {props.store.address}
            </p>
          </div>
          <div className="justify-between bg-[#e2f0e9] px-6  py-2">
            <div className="flex justify-between  space-x-14 text-sm">
              <div className="flex space-x-2">
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2h-4l-4 4v-4H4a2 2 0 01-2-2V5z"></path>
                </svg>
                <p>Entrega</p>
              </div>
              <p className="font-semibold">
                {formatDateToTextDate(props.startDate)}
              </p>
            </div>
            <div className="flex justify-between  space-x-14 text-sm">
              <div className="flex space-x-2">
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2h-4l-4 4v-4H4a2 2 0 01-2-2V5z"></path>
                </svg>
                <p>Recogida</p>
              </div>
              <p className="font-semibold">
                {formatDateToTextDate(props.endDate)}
              </p>
            </div>
            <div className="flex justify-center py-2">
              <hr className="border-1  w-3/4 border-[#848484]" />
            </div>
            {groupedItems.map((size) => {
              return (
                <div
                  key={size.IdSize}
                  className="flex justify-between  space-x-14 text-sm"
                >
                  <p>
                    LOCKER{" "}
                    {
                      props.sizes.find((s: Size) => s.id === size.IdSize)
                        ?.nombre
                    }
                  </p>
                  <p className="font-semibold">
                    {size.Cantidad}{" "}
                    {size.Cantidad === 1 ? "unidad" : "unidades"}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="border-t bg-gray-100 ">
            <div className="px-4 py-2">
              {groupedItems.map((size) => {
                return (
                  <div key={size.IdSize} className="justify-between pb-3">
                    <span>
                      Locker{" "}
                      {
                        props.sizes.find((s: Size) => s.id === size.IdSize)
                          ?.nombre
                      }
                    </span>
                    <div className="flex justify-between pt-1 text-sm">
                      <span>Primer día</span>
                      <span>{size.FirstDayTotal}</span>
                    </div>
                    {size.Days! > 1 && (
                      <div className="flex justify-between text-sm">
                        <span>Días adicionales {size.Days! - 1}</span>
                        <span className="text-red-500">
                          -{size.Fee.discount}% aplicado
                        </span>
                        <span>{size.RestDaysTotal ?? 0}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-between pt-2">
                <span>Subtotal</span>
                <span>{subTotal}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between bg-[#e2f0e9] p-4 text-right">
            <p className="font-bold text-black">Total</p>
            <div className="flex items-baseline">
              <p className="text-xs font-bold text-black"> ARS </p>
              <p className=" font-bold text-black">{total}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
