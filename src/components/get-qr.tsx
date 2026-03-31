"use client";
import { QrCode, RotateCw } from "lucide-react";
import QRCode from "react-qr-code";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { formatDate } from "~/utils/server/utils";
import { Button } from "./ui/button";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function GetQR(props: {
  row: any;
  generatedTokens: Map<number, string>;
  setGeneratedTokens: any;
}) {
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const { mutateAsync: postToken } = api.token.post.useMutation();

  const fechaInicio = new Date();
  fechaInicio.setHours(0, 0, 0, 0);

  const fechaFin = new Date();
  fechaFin.setHours(23, 59, 59, 999);
  function post() {
    const newToken = {
      idLocker,
      idSize,
      idBox,
      token1: Math.floor(100000 + Math.random() * 900000).toString(),
      fechaCreacion: formatDate(new Date().toString()),
      fechaInicio: formatDate(fechaInicio.toString()),
      fechaFin: formatDate(fechaFin.toString()),
      contador: 0,
      cantidad: 1,
      confirmado: true,
      modo: "Por cantidad",
      idBoxNavigation: null,
      idLockerNavigation: null,
      idSizeNavigation: null,
    };
    postToken({ token: newToken });
    // props.setGeneratedTokens(
    //   new Map(props.generatedTokens.set(idBox, newToken.token1)),
    // );
    setCurrentToken(newToken.token1);
  }
  const { row } = props;
  const idLocker = row.original.idLocker;
  const idSize = row.getValue("idSize");
  const idBox = row.getValue("id");
  const handleQRClick = async () => {
    const existingToken = props.generatedTokens.get(idBox);
    if (!existingToken) {
      post();
    } else {
      setCurrentToken(existingToken);
    }
  };

  return (
    <AlertDialog
    //   open={isOpen} onOpenChange={setIsOpen}
    >
      <AlertDialogTrigger asChild>
        <Button
          className="bg-transparent p-1 outline-none hover:bg-transparent"
          onClick={handleQRClick}
        >
          <QrCode color="black" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <div className="pb-4">
          <RotateCw
            className="float-right cursor-pointer "
            onClick={() => {
              post();
            }}
          />
        </div>
        <div
          style={{
            height: "auto",
            margin: "0 auto",
            maxWidth: 128,
            width: "100%",
          }}
        >
          <QRCode
            className="w-full"
            size={512}
            style={{ height: "auto", width: "100%" }}
            value={currentToken ?? ""}
            viewBox={`0 0 512 512`}
          />
        </div>
        <p className="flex w-full items-center justify-center pt-4 text-5xl font-bold">
          {currentToken}
        </p>

        <AlertDialogFooter>
          <AlertDialogCancel
          //   onClick={() => {
          //     setIsOpen(false);
          //     setCurrentToken(null);
          //   }}
          >
            Aceptar
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
