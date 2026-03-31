import React, { useEffect, useRef, useState } from "react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Coin } from "~/server/api/routers/coin";
import { Size } from "~/server/api/routers/sizes";
import { Store } from "~/server/api/routers/store";
import { Translations } from "~/translations";
import { api } from "~/trpc/react";

export default function SizeCard({ t, ...props }: {
  size: Size;
  onClickPlus: () => void;
  onClickMinus: () => void;
  disabledPlus?: boolean;
  disabledMinus?: boolean;
  value: string;
  coin: Coin;
  store: Store;
  t: Translations,
}) {
  const tarifa = api.fee.getById.useQuery({ id: props.size.tarifa!, entityId: props.store.entidadId ?? "" });
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      extractColor();
    }
  }, []);

  const extractColor = () => {
    if (imgRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      canvas.width = imgRef.current.width;
      canvas.height = imgRef.current.height;
      context.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let r = 0,
        g = 0,
        b = 0;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i]!;
        g += data[i + 1]!;
        b += data[i + 2]!;
      }

      r = Math.floor(r / (data.length / 4));
      g = Math.floor(g / (data.length / 4));
      b = Math.floor(b / (data.length / 4));

      setBgColor(`rgb(${r}, ${g}, ${b})`);
    }
  };

  return (
    <>
      {" "}
      {tarifa && (
        <Card className="xs:max-w-xs relative overflow-hidden rounded-lg bg-emerald-100 p-4 shadow-lg sm:max-w-sm md:max-w-md">
          <div
            className="absolute left-2 top-2 flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: bgColor }}
          >
            <span className="text-lg font-bold text-white">
              {props.size.nombre}
            </span>
          </div>
          <div className="mt-6 flex w-full justify-center">
            <img
              ref={imgRef}
              src={props.size.image ? props.size.image : "/placeholder.svg"}
              alt={props.size.nombre!}
              className="object-cover sm:max-w-sm md:h-44 md:max-w-md lg:h-80 lg:max-w-lg"
              crossOrigin="anonymous"
              onLoad={extractColor}
            />
          </div>
          <div className="mt-4 flex justify-start text-sm">
            <span className="text-gray-700">
              {t("firstDay")} {props.coin.description}
              {tarifa.data?.value}
            </span>{" "}
          </div>
          <div className="mt-1 flex justify-start text-sm">
            <span className="text-gray-700">
              {t("additionalDay")} {props.coin.description}
              {(tarifa.data?.value! * (100 - tarifa.data?.discount!)) / 100}
            </span>
          </div>
          {props.size.cantidad !== 0 && (
            <div className="mt-2 flex items-center justify-between gap-4 text-sm">
              <span className=" text-gray-700">{t("lockerCount")}</span>
              <div className="flex items-center md:pr-1">
                <button
                  className="xs:h-6 xs:w-6 flex h-10 w-10 items-center justify-center rounded-l bg-orange-500 font-bold text-white hover:bg-orange-600 md:h-8 md:w-8"
                  disabled={props.disabledMinus}
                  onClick={props.onClickMinus}
                >
                  -
                </button>
                <Input
                  className="xs:h-6 xs:w-8 h-8 w-12 border-none bg-gray-200 text-center text-black md:h-8 md:w-10"
                  disabled={true}
                  value={props.value}
                  onChange={(e) => {
                    // lógica para cambiar el número de lockers
                  }}
                />
                <button
                  className="xs:h-6 xs:w-6 flex h-10 w-10 items-center justify-center rounded-r bg-orange-500 font-bold text-white hover:bg-orange-600 md:h-8 md:w-8"
                  disabled={props.disabledPlus}
                  onClick={props.onClickPlus}
                >
                  +
                </button>
              </div>
            </div>
          )}
          {props.size.cantidad === 0 && (
            <div className="mt-4 text-center text-red-600">
              {t("noLockers")}
            </div>
          )}
        </Card>
      )}
    </>
  );
}
