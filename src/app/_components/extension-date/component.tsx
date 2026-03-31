import { Calendar } from "~/components/ui/calendar";
import { differenceInDays, format, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import { useEffect, useState } from "react";
import ButtonCustomComponent from "../../../components/buttonCustom";
import { api } from "~/trpc/react";
import { Reserve } from "~/server/api/routers/reserves";
import { es } from "date-fns/locale";
import { Translations } from "~/translations";
import { Client } from "~/server/api/routers/clients";
import dayjs from "dayjs";

export default function DateComponent({ t, ...props }: {
  startDate: string | undefined;
  setStartDate: (startDate: string) => void;
  endDate: string | undefined;
  setEndDate: (endDate: string) => void;
  days: number;
  setDays: (days: number) => void;
  token: number;
  email: string;
  setReserve: (reserve: Reserve) => void;
  setFailed: (failed: boolean) => void;
  t: Translations;
  client: Client;
}) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [date, setDate] = useState<Date>();

  const { data: plazoReserva } = api.config.getKey.useQuery({
    key: "reserve_from_now",
    entityId: props.client.entidadId ?? ""
  });
  
  const { data: reserve, isLoading } = api.reserve.getByToken.useQuery({
    token: props.token,
    email: props.email,
    entityId: props.client.entidadId ?? "",
  });

  useEffect(() => {
    if (plazoReserva && typeof range === "undefined") {
      if (plazoReserva?.value.trim().toLowerCase() === "true") {
        props.setDays(1);
      } else {
        props.setDays(0);
      }
    }
  }, [plazoReserva]);

  useEffect(() => {
    if (reserve) {
      setRange({
        from: new Date(reserve.FechaFin!),
        to: dayjs(new Date(reserve.FechaFin!)).add(1, "day").toDate(),
      });
    }
    if (!reserve && !isLoading) props.setFailed(true);
  }, [reserve, isLoading]);

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
    const lastFecha = new Date(range!.from!.getTime() + 1000);
    const nextDay = new Date(range!.from!);
    nextDay.setDate(nextDay.getDate() + 1);
    let start, end;

    if (plazoReserva?.value.trim().toLowerCase() === "true") {
      // let rangeTo = new Date(range!.to!);
      // rangeTo.setUTCHours(nextDay.getUTCHours());
      // rangeTo.setMinutes(nextDay.getMinutes());
      // rangeTo.setSeconds(nextDay.getSeconds());

      // if (Math.abs(dayjs(rangeTo).diff(nextDay, "day")) < 1) {
      //   rangeTo = nextDay;
      // }

      // start = format(lastFecha, "yyyy-MM-dd'T'HH:mm:ss");
      // end = format(rangeTo, "yyyy-MM-dd'T'HH:mm:ss");

      start = format(lastFecha, "yyyy-MM-dd'T'HH:mm:ss");
      end = format(
        lastFecha.getTime() + props.days * 1000 * 60 * 60 * 24 - 1000,
        "yyyy-MM-dd'T'HH:mm:ss",
      );
    } else {
      start = format(nextDay, "yyyy-MM-dd'T'00:00:00");
      end = format(range!.to!, "yyyy-MM-dd'T'23:59:59");
    }

    console.log("date range", start, end);
    props.setStartDate(start);
    props.setEndDate(end);

    props.setReserve(reserve!);
    getDays();
  }

  function onlyToday() {
    const today = new Date(Date.now());
    const nextDay = new Date(range!.from!);
    nextDay.setTime(nextDay.getTime() + (1000 * 60 * 60 * 24));
    let start, end;

    if (plazoReserva?.value.trim().toLowerCase() === "true") {
      const nextNextDay = new Date(nextDay.getTime());
      nextNextDay.setDate(nextNextDay.getTime() + (1000 * 60 * 60 * 24));

      start = format(nextDay, "yyyy-MM-dd'T'HH:mm:ss");
      end = format(nextNextDay, "yyyy-MM-dd'T'HH:mm:ss");
    } else {
      start = format(nextDay, "yyyy-MM-dd'T'00:00:00");
      end = format(today, "yyyy-MM-dd'T'23:59:59");
    }

    console.log("date range", start, end);
    props.setStartDate(start);
    props.setEndDate(end);

    props.setReserve(reserve!);
    getDays();
  }

  if (!reserve) return <div>cargando...</div>;
  return (
    <div>
      {!props.endDate && (
        <div className="container flex flex-col items-center justify-center gap-6 ">
          <h2 className="text-3xl font-semibold">
            {t("extendReserveTitle")}
          </h2>
          <div className="justify-center">
            <div className="w-full">
              <Calendar
                mode="range"
                selected={range}
                onSelect={(e) => {
                  const toDate = e?.to!;
                  const days = differenceInDays(toDate, range?.from!);
                  props.setDays(days + 1);
                  setRange({ to: e?.to!, from: range?.from });
                }}
                numberOfMonths={2}
                disabled={(date) => date < new Date()}
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
                  disabled={new Date() <= new Date(reserve.FechaFin!)}
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
