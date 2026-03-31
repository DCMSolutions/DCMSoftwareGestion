"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle, DownloadIcon, Share2Icon, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import ButtonCustomComponent from "~/components/buttonCustom";
import QRCode from "react-qr-code";

import { Reserve } from "~/server/api/routers/lockerReserveRouter";
import { Size } from "~/server/api/routers/sizes";
import { StoreSimple } from "~/server/api/routers/store";
import type { Translations } from "~/translations";
import { useIsMobile } from "~/hooks/use-mobile";
import { api } from "~/trpc/react";

export default function Success({ t, ...props }: {
  reserves: Reserve[];
  store: StoreSimple;
  nReserve: number;
  total: number;
  coin?: { description?: string | null };
  checkoutNumber: string;
  sizes: Size[];
  startDate: string | undefined;
  endDate: string | undefined;
  t: Translations;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { data: plazoReserva } = api.config.getKey.useQuery({ key: "reserve_from_now", entityId: props.store.entidadId ?? "" });
  const isReserveModeNow = useMemo(() => (plazoReserva?.value.trim().toLowerCase() ?? "false") === "true", [plazoReserva]);

  const [failedToShareNative, setFailedToShareNative] = useState(false);
  const canShareNative = useMemo(() => (('share' in navigator && navigator.canShare())), [navigator]);
  useEffect(() => {
    window.scrollTo({
      top: 110,
      behavior: "smooth",
    });
  }, []);

  function getSize(idSize: number) {
    const size = props.sizes.find((s: Size) => s.id === idSize);
    return size?.nombre ?? "";
  }

  function formatDateToTextDate(dateString?: string): string {
    if (dateString) {
      const date = new Date(dateString);
      if (isReserveModeNow) {
        return format(date, "eee dd MMMM HH:mm", { locale: es });
      } else {
        return format(date, "eee dd MMMM", { locale: es });
      }
    }
    return "";
  }

  const downloadImage = async () => {
    if (!targetRef.current) return;

    const canvas = await html2canvas(targetRef.current, { scale: 2 });
    const image = canvas.toDataURL("image/jpeg");

    const link = document.createElement("a");
    link.href = image;
    link.download = `comprobante_${props.checkoutNumber}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const share = async () => {
    if (!targetRef.current) {
      return;
    }

    let message = `${t("shareWhatsappHeader")}\n${t("nReserve")}: ${props.nReserve}\n${t("local")}: ${props.store.name}`;
    for (const r of props.reserves) {
      message += `\n${t("token")} (${getSize(r.IdSize!)}): ${r.Token1}`;
    }

    let url: null | string = null;
    if (canShareNative && !failedToShareNative) {
      const canvas = await html2canvas(targetRef.current, { scale: 2 });
      canvas.toBlob((v) => {
        if (!v) {
          console.error("canvas toBlob !v");
          setFailedToShareNative(true);
        } else {
          navigator.share({
            files: [new File([v], `comprobante_${props.checkoutNumber}.jpg`)]
          }).then(v => console.log('compartido', v))
            .catch(e => {
              setFailedToShareNative(true);
              console.error('navigator share error', e)
            });
        }
      });
    } else if (isMobile) {
      url = "whatsapp://send?text=" + encodeURIComponent(message);
    } else {
      url = "https://web.whatsapp.com/send?text=" + encodeURIComponent(message);
    }

    if (url !== null) {
      window.open(url, '_blank');
    }
  }

  return (
    <main className="flex max-h-screen justify-center px-1 pb-1">
      {props.reserves && (
        <div className="w-full max-w-md">
          <div
            ref={targetRef}
            className="w-full overflow-hidden rounded-lg bg-white shadow-sm"
          >
            <div className="bg-[#e2f0e9] px-1 py-2">
              <div className="flex justify-center text-sm">
                <CheckCircle color="#FF813A" className="w-10" />
              </div>
              <div className="flex justify-center pt-1 text-center text-sm font-bold text-[#848484]">
                <p>{t("paymentSuccess")}</p>
              </div>
              <div className="flex justify-center pt-1 text-center text-xs italic text-[#848484]">
                <p>{t("downloadToken")}</p>
              </div>
            </div>
            <div className="bg-gray-100 px-4 py-3">
              <div className="text-xs">
                <div className="flex justify-between">
                  <p>
                    <b>{t("nReserve")}</b>
                  </p>
                  <p>{props.nReserve}</p>
                </div>
                <div className="flex justify-between">
                  <p>
                    <b>{t("org")}</b>
                  </p>
                  <p>{props.store.organizationName}</p>
                </div>
                <div className="flex justify-between">
                  <p>
                    <b>{t("local")}</b>
                  </p>
                  <p>{props.store.name}</p>
                </div>
                <div className="flex justify-between">
                  <p>
                    <b>{t("address")}</b>
                  </p>
                  <p>{props.store.address}</p>
                </div>
              </div>
              <hr className="my-2 border-[#848484]" />
              <div className="text-xs">
                <div className="flex justify-between">
                  <p>
                    <b>{t("importe")}</b>
                  </p>
                  <p>
                    {props.coin?.description} {props.total}
                  </p>
                </div>
              </div>
              <hr className="my-2 border-[#848484]" />
              <div className="text-xs">
                <div className="flex justify-between">
                  <p>
                    <b>{t("period")}</b>
                  </p>
                </div>
                <div className="flex justify-between">
                  <p>{t("deliveryDate")}</p>
                  <p>
                    {formatDateToTextDate(
                      props.startDate ?? props.reserves[0]?.FechaInicio!,
                    )}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p>{t("collectionDate")}</p>
                  <p>
                    {formatDateToTextDate(
                      props.endDate ?? props.reserves[0]?.FechaFin!,
                    )}
                  </p>
                </div>
              </div>
              <hr className="my-2 border-[#848484]" />
              <div className="text-xs">
                <p>
                  <b>{t("tokens")}</b>
                </p>
                {props.reserves.map((r, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2"
                  >
                    <div>
                      <p>{t("token")} ({getSize(r.IdSize!)})</p>
                    </div>
                    <div>
                      <QRCode
                        size={75}
                        value={r.Token1?.toString() ?? ""}
                        viewBox="0 0 128 128"
                      />
                      <p className="mt-2 text-center text-[#848484]">
                        {r.Token1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2">
            <ButtonCustomComponent
              onClick={() => location.reload()}
              text={t("close")}
              icon={<XCircle className="h-4 w-4" />}
            />
            <ButtonCustomComponent
              onClick={downloadImage}
              text={t("download")}
              icon={<DownloadIcon className="h-4 w-4" />}
            />
            <ButtonCustomComponent
              onClick={share}
              text={(canShareNative && !failedToShareNative) ? t("share") : t("shareWhatsapp")}
              icon={<Share2Icon className="h-4 w-4" />}
            />
          </div>
        </div>
      )}
    </main>
  );
}
