"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Client } from "~/server/api/routers/clients";
import { countries } from "countries-list";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";
import { Cupon } from "~/server/api/routers/cupones";
import type { Translations } from "~/translations";
import { Store } from "~/server/api/routers/store";

export default function UserForm({
  t,
  ...props
}: {
  client: Client;
  store: Store | null;
  setClient: (client: Client) => void;
  setCupon: ((cupon: Cupon) => void) | null;
  errors: {
    name: string;
    surname: string;
    email: string;
    prefijo: string;
    telefono: string;
    terms: string;
    dni: string;
  } | null;
  setErrors:
    | ((errors: {
        name: string;
        surname: string;
        email: string;
        prefijo: string;
        telefono: string;
        terms: string;
        dni: string;
      }) => void)
    | null;
  terms: boolean | null;
  setTerms: ((terms: boolean) => void) | null;
  editable: boolean;
  t: Translations;
}) {
  const { mutateAsync: useCupon } = api.cupones.getByCode.useMutation();
  const [phones, setPhones] = useState<Record<string, number>[]>();
  const [discount, setDiscount] = useState<string>("");
  const [discountCode, setDiscountCode] = useState<string>("");
  const [applyButton, setApplyButton] = useState<boolean>();

  const { data: tycData } = api.config.getKey.useQuery({
    entityId: props.store?.entidadId ?? props.client.entidadId ?? "",
    key: "tyc_link"
  });

  useEffect(() => {
    const phoneNumbers: Record<string, number>[] = [];
    Object.entries(countries).forEach(([countryCode, countryData]) => {
      const { phone } = countryData;
      if (countryCode === "AR") {
        phoneNumbers.unshift({ [countryCode]: phone[0]! });
      } else {
        phoneNumbers.push({ [countryCode]: phone[0]! });
      }
    });
    setPhones(phoneNumbers);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (props.setClient) props.setClient({ ...props.client, [name]: value });
    if (props.setErrors && props.errors)
      props.setErrors({ ...props.errors, [name]: "" });
  };

  function applyDiscount() {
    const response = useCupon({
      codigo: discountCode,
      entityId: props.store?.entidadId ?? props.client.entidadId ?? "",
    }).then((cupon) => {
      if (cupon) {
        if (props.setCupon) props.setCupon(cupon);
        setApplyButton(true);
      }
    });
  }

  if (!props.client) return <div>{t("loading")}</div>;
  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg bg-[#F0F0F0] p-6 shadow-md md:grid-cols-12 md:px-3 md:py-6">
      <h2 className="col-span-1 text-lg font-bold text-black md:col-span-12">
        {t("userFormComplete")}
      </h2>
      <Input
        disabled={!props.editable}
        className="col-span-1 rounded border-2 border-buttonPick focus:border-buttonPick md:col-span-6"
        placeholder={t("userFormNamePlaceholder")}
        name="name"
        value={props.client.name!}
        onChange={handleChange}
      />
      <Input
        disabled={!props.editable}
        className="col-span-1 rounded border-2 border-buttonPick focus:border-buttonPick md:col-span-6"
        placeholder={t("userFormSurnamePlaceholder")}
        name="surname"
        value={props.client.surname!}
        onChange={handleChange}
      />
      <span className="col-span-1 text-red-500 md:col-span-6">
        {props.errors?.name}
      </span>
      <span className="col-span-1 text-red-500 md:col-span-6">
        {props.errors?.surname}
      </span>
      <Input
        disabled={!props.editable}
        className="col-span-1 rounded border-2 border-buttonPick focus:border-buttonPick md:col-span-6"
        placeholder={t("userFormEmailPlaceholder")}
        name="email"
        value={props.client.email!.toLowerCase()}
        onChange={handleChange}
      />
      <Input
        disabled={!props.editable}
        className="col-span-1 rounded border-2 border-buttonPick focus:border-buttonPick md:col-span-6"
        placeholder={t("userFormDniPlaceholder")}
        name="dni"
        value={props.client.dni ? props.client.dni : ""}
        onChange={(e) => {
          const { name, value } = e.target;
          if (props.setClient)
            props.setClient({ ...props.client, [name]: value });
          if (props.setErrors && props.errors)
            props.setErrors({ ...props.errors, [name]: "" });
        }}
      />
      <span className="col-span-1 text-red-500 md:col-span-6">
        {props.errors?.email}
      </span>
      <span className="col-span-1 text-red-500 md:col-span-6">
        {props.errors?.dni}
      </span>
      <div className="col-span-1 rounded border-2 border-buttonPick focus:border-buttonPick md:col-span-4">
        <Select
          disabled={!props.editable}
          onValueChange={(value: string) => {
            if (props.setClient)
              props.setClient({
                ...props.client,
                prefijo: parseInt(value),
              });
            if (props.setErrors && props.errors)
              props.setErrors({ ...props.errors, prefijo: "" });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Cod País" />
          </SelectTrigger>
          <SelectContent className="max-h-60 w-64">
            <SelectGroup>
              <SelectLabel>{t("userFormPrefixes")}</SelectLabel>
              {phones?.map((item) => (
                <SelectItem
                  key={Object.keys(item)[0]}
                  value={item[Object.keys(item)[0]!]!.toString()}
                >
                  ({item[Object.keys(item)[0]!]!.toString()}){" "}
                  {Object.keys(item)[0]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Input
        disabled={!props.editable}
        className="col-span-1 rounded border-2 border-buttonPick focus:border-buttonPick md:col-span-8"
        placeholder={t("userFormPhonePlaceholder")}
        name="telefono"
        value={props.client.telefono ? props.client.telefono : undefined}
        onChange={(e) => {
          const { name, value } = e.target;
          if (props.setClient)
            props.setClient({ ...props.client, [name]: parseInt(value) });
          if (props.setErrors && props.errors)
            props.setErrors({ ...props.errors, [name]: "" });
        }}
      />
      {props.errors?.prefijo && (
        <span className="col-span-1 text-red-500 md:col-span-4">
          {props.errors.prefijo}
        </span>
      )}
      {props.errors?.telefono && (
        <span className="col-span-1 text-red-500 md:col-span-8">
          {props.errors.telefono}
        </span>
      )}
      <Label className="col-span-1 text-xs text-buttonPick md:col-span-12">
        {t("userFormCoupon") + " "}
      </Label>
      <div className="col-span-1 flex md:col-span-12">
        <Input
          disabled={!props.editable}
          className="flex-grow rounded-l-md rounded-r-none border-2 border-r-0 border-buttonPick px-2 focus:border-buttonHover focus:ring-0"
          placeholder={t("userFormCouponApply")}
          value={discountCode}
          onChange={(e) => {
            setDiscountCode(e.target.value);
          }}
        />
        <Button
          className="rounded-l-none rounded-r-md border-2 border-l-0 border-buttonPick bg-buttonPick text-white hover:bg-buttonHover"
          onClick={applyDiscount}
          disabled={applyButton}
        >
          {t("apply")}
        </Button>
      </div>
      <div className="col-span-1 flex items-center space-x-2 py-4 md:col-span-12">
        <Checkbox
          id="terms"
          onCheckedChange={(e: boolean) => {
            if (props.setTerms) props.setTerms(e);
          }}
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t("userFormTOSAccept") + " "}
          <i
            className="hover:underline"
            onClick={() => {
              open(tycData?.value ?? "");
            }}
          >
            {t("userFormTOS")}
          </i>
        </label>
        <span className="text-xxs text-red-500">{props.errors?.terms}</span>
      </div>
      {/* <div className="col-span-1 text-center md:col-span-12">
        <label htmlFor="terms" className="text-sm">
          <strong>¿Necesitas ayuda? Llámanos al +54 9 294 492-7340</strong>
        </label>
      </div> */}
    </div>
  );
}
