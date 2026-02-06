import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "./ui/button";
import Image from "next/image";

export function About() {
  return (
    <div className="pb-3 pt-2">
      <AlertDialog>
        <AlertDialogTrigger className="w-full">
          Acerca de ...
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="col-12 flex pb-4">
              <div className="col-6">
                <Image
                  src="/dcm.png"
                  width={250}
                  height={250}
                  alt={"dcm.png"}
                />
              </div>
              <div className="col-6">
                <AlertDialogTitle className="pb-4">
                  Versión 9.10.2
                </AlertDialogTitle>
                <AlertDialogTitle>Fecha: 6 de febrero de 2026</AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription>
              <a>Licencia: Evaluación</a>
            </AlertDialogDescription>

            <AlertDialogDescription>
              <a>Copyright © 2024 Lockers Inteligentes DCM Solution S.A.</a>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
