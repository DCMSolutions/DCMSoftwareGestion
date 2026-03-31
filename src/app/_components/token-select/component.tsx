"use client";

import { useState } from "react";
import ButtonCustomComponent from "~/components/buttonCustom";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import { Client } from "~/server/api/routers/clients";
import { Translations } from "~/translations";
import { api } from "~/trpc/react";

export default function SelectToken({ t, ...props }: {
  token: number | undefined;
  email: string;
  setToken: (token: number) => void;
  setClient: (client: Client) => void;
  setFailed: (failed: boolean) => void;
  t: Translations;
}) {
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<number>();
  const { data: client, isLoading } = api.clients.getByEmailAndToken.useQuery({
    email: props.email,
    token: token ?? Number.MIN_SAFE_INTEGER
  });

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Asegurar que el valor no tenga más de 6 cifras
    if (value.length <= 6) {
      setToken(parseInt(value));
      setError(null); // Limpiar el mensaje de error al cambiar el valor
    }
  };

  const handleSubmit = () => {
    if (token && token.toString().length === 6) {
      props.setToken(token!);
      if (!isLoading) {
        if (!client) props.setFailed(true);
        props.setClient(client!);
      }
    } else {
      setError(t("tokenInvalidDigits"));
    }
  };

  return (
    <div className="mt-10 flex w-full items-center justify-center">
      <div className="w-full px-4 text-center md:w-1/2 lg:w-1/4">
        <Input
          className="rounded-border-2 mb-4 w-full border-buttonPick focus:border-buttonPick "
          placeholder={t("tokenInsert")}
          name="token"
          type="number"
          value={token}
          onChange={handleTokenChange}
        />
        {error && <p className="text-red-500">{error}</p>}
        <ButtonCustomComponent onClick={handleSubmit} disabled={!client || isLoading} text={`Enviar`} />
      </div>
    </div>
  );
}
