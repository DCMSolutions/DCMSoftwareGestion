"use client";
import { City } from "~/server/api/routers/city";
import { Button } from "~/components/ui/button";
import StoreSelector from "./store/selector";
import { Store } from "~/server/api/routers/store";
import { Size } from "~/server/api/routers/sizes";
import SizeSelector from "./sizes/selector";
import { api } from "~/trpc/react";
import Header from "./header";
import { Reserve } from "~/server/api/routers/lockerReserveRouter";
import DateComponent from "./dates/dateComponent";
import Booking from "./booking/booking";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { ChevronLeftCircle, ChevronRightIcon, Loader2 } from "lucide-react";
import Success from "./success/success";
import { Client } from "~/server/api/routers/clients";
import Payment from "./payment/page";
import { Coin } from "~/server/api/routers/coin";
import { useEffect, useMemo, useState } from "react";
import UserForm from "./user/userForm";
import ButtonCustomComponent from "~/components/buttonCustom";
import { Cupon } from "~/server/api/routers/cupones";
import Extension from "./extension_page";
import { Badge } from "~/components/ui/badge";
import CitySelector from "./city/selector";
import ButtonIconCustomComponent from "~/components/button-icon-custom";
import { useTranslations } from "next-intl";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";

export const Icons = {
  spinner: Loader2,
};

let paymentDisabledRef = false;
export default function HomePage(props: {
  cities: City[];
  lang?: string;
}) {
  const t = useTranslations('HomePage');
  const { data: loadedStores = [] } = api.store.get.useQuery();

  const [paymentDisabled, setPaymentDisabled] = useState(false);
  const [city, setCity] = useState<City | null>(null);
  const [stores, setStores] = useState<Store[]>();
  const [store, setStore] = useState<Store | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [sizeSelected, setsizeSelected] = useState(false);
  const [startDate, setStartDate] = useState<string>();
  const [checkoutNumber, setCheckoutNumber] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [reserva, setReserva] = useState<boolean>(false);
  const [pagoOk, setPagoOk] = useState<boolean>(false);
  const [days, setDays] = useState<number>(0);
  const [cupon, setCupon] = useState<Cupon>();
  const { mutateAsync: reservarBox } =
    api.lockerReserve.reserveBox.useMutation();
  const { mutateAsync: reserveToClient } =
    api.reserve.reservesToClients.useMutation();
  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [loadingPay, setLoadingPay] = useState<boolean>(false);
  const [failedResponse, setFailedResponse] = useState<boolean>(false);
  const [responseError, setResponseError] = useState<string>();
  const [nReserve, setNReserve] = useState<number>(0);
  // const [token, setToken] = useState<number[]>([]);
  const [client, setClient] = useState<Client>({
    identifier: 0,
    name: "",
    surname: "",
    email: "",
    prefijo: 0,
    telefono: 0,
    dni: "",
    entidadId: "",
  });

  const { data: loadedSizes = [], refetch: refetchSizes } = api.size.get.useQuery({
    store: store?.identifier ?? "",
  });

  useEffect(() => {
    refetchSizes();
  }, [store]);

  const { mutateAsync: createClient } = api.clients.create.useMutation();

  const [totalPre, setTotalPre] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [coin, setCoin] = useState<Coin>();
  const { mutateAsync: test } = api.mobbex.test.useMutation();
  const { data: coins } = api.coin.get.useQuery();
  const [terms, setTerms] = useState<boolean>();
  const [isExtension, setIsExtension] = useState<boolean>(false);

  const [errors, setErrors] = useState({
    name: "",
    surname: "",
    email: "",
    prefijo: "",
    telefono: "",
    terms: "",
    dni: "",
  });
  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  const handleSubmit = () => {
    const newErrors = {
      name: client.name ? "" : t("mandatoryName"),
      surname: client.surname ? "" : t("mandatorySurname"),
      email: isValidEmail(client.email!) ? "" : t("invalidEmail"),
      prefijo: client.prefijo ? "" : t("mandatoryPrefix"),
      telefono: client.telefono ? "" : t("invalidPhone"),
      terms: terms ? "" : t("acceptTerms"),
      dni: client.dni ? "" : t("needsDni"),
    };

    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);

      return false;
    }
    return true;
  };

  const storesFinal = useMemo(() => {
    if (props.cities.length === 0) {
      return loadedStores;
    } else {
      return stores;
    }
  }, [stores, props]);

  const envVariable = process.env.NEXT_PUBLIC_NODE_ENV || t("loading");

  function AlertFailedResponse() {
    return (
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("someError")}</AlertDialogTitle>
            <AlertDialogDescription>{responseError}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                location.reload();
              }}
            >
              {t("accept")}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  async function onContinueToPayment(client: {
    identifier: number;
    name: string | null;
    surname: string | null;
    email: string | null;
    prefijo: number | null;
    telefono: number | null;
    dni: string | null;
  }) {
    try {
      let failed = false;
      if (handleSubmit()) {
        const clientResponse = await createClient(
          {
            ...client,
            entityId: store?.entidadId ?? "",
          }
        ).then(async (res: any) => {
          //creo una reserva para este cliente y seteo el numero de reserva
          const nreserve = await reserveToClient({
            clientId: res.id,
            entityId: store?.entidadId ?? "",
          });

          setNReserve(nreserve!);
          for (const reserve of reserves) {
            reserve.client = client.email;
            const response = await reservarBox(
              {
                ...reserve!,
                entityId: store?.entidadId ?? "",
              }
            );
            const IdTransaction = parseInt(response);
            if (!isNaN(IdTransaction)) {
              reserve.IdTransaction = IdTransaction;
            } else {
              if (
                response ==
                "El locker está desconectado"
              ) {
                setResponseError(t("outOfService"));
              } else {
                setResponseError(t("reservedWhileOperating"));
              }

              failed = true;
              setFailedResponse(true);
            }
          }

          return res;
        });
        if (!failed) {
          setReserva(true);
          const checkoutNumber = await test({
            amount: total,
            reference: clientResponse.id.toString(),
            mail: client.email!,
            name: client.name!,
            uid: client.identifier!,
            cantidad: reserves.length,
            phone: `${client.prefijo ?? 0}${client.telefono ?? 0}`,
            identification: client.dni ?? "0",
            entityId: store?.entidadId ?? "",
          });
          setCheckoutNumber(checkoutNumber);
        }
      }
    } catch (error) {
      console.log(error);
    }
    setPaymentDisabled(false);
  }

  return (
    <>
      <SidebarProvider>
        <div className="min-w-full min-h-full">
          <Header lang={props.lang} />
          <div className="min-w-full">
            <AppSidebar lang={props.lang} />
            {envVariable === "testing" ||
              (envVariable === "development" && (
                <div className="px-8 text-left">
                  <Badge>{envVariable}</Badge>
                </div>
              ))}
            {!isExtension && (
              <div className="container absolute">
                {failedResponse && <AlertFailedResponse />}
                <div className="flex flex-col items-center justify-center ">
                  {((!city && props.cities.length > 0) || !Array.isArray(storesFinal)) && 
                    <CitySelector
                      cities={props.cities}
                      city={city}
                      setCity={setCity}
                      setStores={setStores}
                      t={t}
                    />}
                  {(!store && (city !== null || props.cities.length === 0) && Array.isArray(storesFinal)) && (
                    <div>
                      <div className="flex flex-col items-center justify-center ">
                        <div className="flex flex-col items-center justify-center ">
                          <StoreSelector
                            stores={storesFinal}
                            store={store}
                            setStore={setStore}
                            t={t}
                            goBack={() => {
                              setStore(null);
                              setCity(null);
                              setStores(undefined);
                            }}
                          />{" "}
                        </div>
                        <div className="flex flex-col items-center justify-center ">
                          <ButtonCustomComponent
                            onClick={() => setIsExtension(true)}
                            text={t("extendReserve")}
                          />
                        </div>{" "}
                      </div>
                    </div>
                  )}
                  {store && (
                    <div>
                      <DateComponent
                        startDate={startDate!}
                        setStartDate={setStartDate}
                        endDate={endDate!}
                        setEndDate={setEndDate}
                        days={days}
                        setDays={setDays}
                        store={store}
                        t={t}
                        goBack={() => {
                          setStore(null);
                          setTotalPre(0);
                          setTotal(0);
                        }}
                      />
                    </div>
                  )}
                  {endDate && store && (
                    <SizeSelector
                      store={store}
                      inicio={startDate}
                      fin={endDate}
                      size={size}
                      setSize={setSize}
                      sizeSelected={sizeSelected}
                      setSizeSelected={setsizeSelected}
                      reserves={reserves}
                      setReserves={setReserves}
                      startDate={startDate!}
                      endDate={endDate}
                      coins={coins!}
                      setFailedResponse={setFailedResponse}
                      failedResponse={failedResponse}
                      total={totalPre}
                      setTotal={setTotalPre}
                      t={t}
                      goBack={() => {
                        setEndDate(undefined);
                        setStartDate(undefined);
                        setDays(0);
                      }}
                    />
                  )}
                  {loadingPay && <Icons.spinner className="h-4 w-4 animate-spin" />}
                  {sizeSelected && !reserva && !loadingPay && (
                    <div>
                      <ButtonIconCustomComponent className="mx-4" noWFull={true} icon={<ChevronLeftCircle />} onClick={() => {
                        setsizeSelected(false);
                        setFailedResponse(false);
                        setReserves([]);
                      }} />
                      <div className="flex flex-col items-center lg:flex-row lg:space-x-10">
                        <div className="w-full lg:w-auto">
                          <UserForm
                            store={store}
                            client={client}
                            setClient={setClient}
                            errors={errors}
                            setErrors={setErrors}
                            terms={terms!}
                            setTerms={setTerms}
                            setCupon={setCupon}
                            editable={true}
                            t={t}
                          />
                        </div>
                        <div className="w-full lg:w-auto">
                          <Booking
                            store={store!}
                            startDate={startDate!}
                            endDate={endDate!}
                            reserves={reserves}
                            totalPre={totalPre}
                            total={total}
                            setTotal={setTotal}
                            coin={coin!}
                            setCoin={setCoin}
                            coins={coins!}
                            sizes={loadedSizes}
                            cupon={cupon}
                            isExt={false}
                            t={t}
                            onEdit={() => {
                              setsizeSelected(false);
                              setFailedResponse(false);
                              setReserves([]);
                            }}
                          />
                          <div className="flex justify-end py-2">
                            <ButtonCustomComponent
                              disabled={paymentDisabled}
                              text={t("continueToPayment")}
                              onClick={() => {
                                if (paymentDisabledRef) {
                                  return;
                                }

                                paymentDisabledRef = true;
                                setPaymentDisabled(true);
                                onContinueToPayment(client).then(v => {
                                  console.log('to payment ok', v);
                                  setPaymentDisabled(false);
                                  paymentDisabledRef = false;
                                }).catch(e => {
                                  console.error('to payment error', e);
                                  setPaymentDisabled(false);
                                  paymentDisabledRef = false;
                                });
                              }}
                              after={true}
                              icon={<ChevronRightIcon className="h-4 w-4 " />}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {reserva && !pagoOk && !loadingPay && (
                    <div className="flex flex-row-reverse">
                      {!loadingPay && (
                        <Payment
                          checkoutNumber={checkoutNumber!}
                          setLoadingPay={setLoadingPay}
                          client={client}
                          coin={coin!}
                          endDate={endDate!}
                          startDate={startDate!}
                          nReserve={nReserve}
                          reserves={reserves}
                          setPagoOk={setPagoOk}
                          setReserves={setReserves}
                          sizes={loadedSizes}
                          store={store!}
                          total={total}
                          cupon={cupon}
                          isExt={false}
                          t={t}
                        />
                      )}
                    </div>
                  )}
                  {pagoOk && (
                    <div>
                      <div>
                        <Success
                          reserves={reserves}
                          store={store!}
                          nReserve={nReserve}
                          total={total}
                          coin={coin}
                          checkoutNumber={checkoutNumber!}
                          sizes={loadedSizes}
                          startDate={startDate}
                          endDate={endDate}
                          t={t}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {isExtension && (
              <div className="container absolute">
                <Extension t={t} sizes={loadedSizes} onBack={() => {
                  setIsExtension(false);
                }} />
              </div>
            )}
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
