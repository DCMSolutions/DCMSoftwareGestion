import { Calendar } from "~/components/ui/calendar";
import { differenceInDays, format, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import { useEffect, useMemo, useState } from "react";
import ButtonCustomComponent from "../../../components/buttonCustom";
import { es } from "date-fns/locale";
import { Button } from "~/components/ui/button";
import { ChevronLeftCircle } from "lucide-react";
import ButtonIconCustomComponent from "~/components/button-icon-custom";
import type { Translations } from "~/translations";
import { api } from "~/trpc/react";
import { Store } from "~/server/api/routers/store";

export default function DateComponent({
  t,
  ...props
}: {
  store: Store;
  startDate: string;
  setStartDate: (startDate: string) => void;
  endDate: string;
  setEndDate: (endDate: string) => void;
  days: number;
  setDays: (days: number) => void;
  goBack: () => void;
  t: Translations;
}) {
  const { data: plazoReserva } = api.config.getKey.useQuery({
    key: "reserve_from_now",
    entityId: props.store.entidadId ?? ""
  });
  const [range, setRange] = useState<DateRange | undefined>();

  useEffect(() => {
    if (plazoReserva && typeof range === "undefined") {
      if (plazoReserva?.value.trim().toLowerCase() === "true") {
        const today = Date.now();
        const end = today + 1000 * 60 * 60 * 24 - 1000;

        setRange({ from: new Date(today), to: new Date(end) });
        props.setDays(1);
      } else {
        const fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date();
        toDate.setHours(23, 59, 0, 0);

        setRange({ from: fromDate, to: toDate });
        props.setDays(0);
      }
    }
  }, [plazoReserva]);

  function getDays() {
    if (range) {
      const fromDate = range.from!;
      const toDate = range.to!;
      const differenceInTime = toDate?.getTime() - fromDate?.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);
      props.setDays(differenceInDays);
    }
  }

  function handleClick() {
    const today = Date.now();
    let start, end;

    if (plazoReserva?.value.trim().toLowerCase() === "true") {
      start = format(today, "yyyy-MM-dd'T'HH:mm:ss");
      end = format(
        today + props.days * 1000 * 60 * 60 * 24 - 1000,
        "yyyy-MM-dd'T'HH:mm:ss",
      );
    } else {
      start = format(today, "yyyy-MM-dd'T'00:00:00");
      end = format(range!.to!, "yyyy-MM-dd'T'23:59:59");
    }

    console.log("date range", start, end);
    props.setStartDate(start);
    props.setEndDate(end);
    getDays();
  }

  function onlyToday() {
    const today = Date.now();
    let start, end;

    if (plazoReserva?.value.trim().toLowerCase() === "true") {
      start = format(today, "yyyy-MM-dd'T'HH:mm:ss");
      end = format(today + 1000 * 60 * 60 * 24 - 1000, "yyyy-MM-dd'T'HH:mm:ss");
    } else {
      start = format(today, "yyyy-MM-dd'T'00:00:00");
      end = format(today, "yyyy-MM-dd'T'23:59:59");
    }

    console.log("date range", start, end);
    props.setStartDate(start);
    props.setEndDate(end);
    getDays();
  }

  const textoReservas = useMemo(() => {
    if (!plazoReserva) {
      return "";
    } else if (plazoReserva.value.trim().toLowerCase() === "true") {
      return t("dateReservesTextNow");
    } else {
      return t("dateReservesText");
    }
  }, [t, plazoReserva]);

  return (
    <div>
      {!props.endDate && (
        <div className="container flex flex-col items-center justify-center  ">
          <div className="flex flex-row">
            <ButtonIconCustomComponent
              className="mx-4"
              noWFull={true}
              icon={<ChevronLeftCircle />}
              onClick={props.goBack}
            />
            <h2 className="text-3xl font-semibold">{t("chooseDate")}</h2>
          </div>
          <p>{textoReservas}</p>
          <div className="justify-center">
            <div className="w-full">
              <Calendar
                mode="range"
                selected={range}
                onSelect={(e) => {
                  if (!e) {
                    console.log("PORONGA capo");
                    return;
                  }

                  const days = differenceInDays(e.to!, e.from!);
                  props.setDays(days + 1);
                  setRange({ to: e.to!, from: range?.from });
                }}
                numberOfMonths={2}
                disabled={(date) =>
                  date <= new Date(new Date().setHours(0, 0, 0, 0))
                }
                initialFocus
                locale={es}
              />
            </div>
            <div className="flex flex-col pt-1 md:flex-row-reverse md:justify-between">
              <div className="mb-2 px-1 md:mb-0 md:w-1/2 lg:w-1/4">
                <ButtonCustomComponent
                  onClick={handleClick}
                  disabled={
                    range?.to == undefined ||
                    isNaN(props.days) ||
                    props.days == 0
                  }
                  text={`${t("apply")} ${isNaN(props.days) ? 0 : props.days} ${t("days")}`}
                />
              </div>
              <div className="px-1 md:mb-0 md:w-1/2 lg:w-1/4">
                <ButtonCustomComponent
                  onClick={onlyToday}
                  text={t("dateOnlyToday")}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
