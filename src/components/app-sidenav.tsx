import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav";
import {
  AlignStartVerticalIcon,
  CloudIcon,
  CogIcon,
  DollarSignIcon,
  GroupIcon,
  KeyRound,
  ReceiptIcon,
  Settings2Icon,
  UserIcon,
  LayoutDashboardIcon,
  PercentCircleIcon,
  AreaChartIcon,
  BanIcon,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { About } from "./about-dialog";
import { Button } from "./ui/button";

export default function AppSidenav(props: { isAdmin: boolean }) {
  return (
    <div className="text-xs">
      <Sidenav>
        {props.isAdmin && <SidenavSeparator>Mantenimiento</SidenavSeparator>}
        {props.isAdmin && (
          <SidenavItem icon={<UserIcon />} href="/panel/usuarios">
            Usuarios
          </SidenavItem>
        )}
        {props.isAdmin && (
          <SidenavItem icon={<BanIcon />} disabled={true}>
            Roles
          </SidenavItem>
        )}
        {props.isAdmin && (
          <SidenavItem icon={<KeyRound />} disabled={true}>
            Permisos
          </SidenavItem>
        )}
        {props.isAdmin && (
          <SidenavItem
            icon={<CogIcon />}
            disabled={false}
            href="/panel/parametros"
          >
            Parámetros
          </SidenavItem>
        )}
        <SidenavSeparator>Administración</SidenavSeparator>
        <SidenavItem
          icon={<AreaChartIcon />}
          disabled={false}
          href="/panel/reportes"
        >
          Reportes
        </SidenavItem>
        <SidenavItem icon={<LayoutDashboardIcon />} href="/panel/monitor">
          Monitor
        </SidenavItem>
        <SidenavItem icon={<CloudIcon />} href="/panel/ciudades">
          Ciudades{" "}
        </SidenavItem>
        <SidenavItem icon={<AlignStartVerticalIcon />} href="/panel/locales">
          Locales
        </SidenavItem>
        <SidenavItem icon={<GroupIcon />} href="/panel/tamanos">
          Tamaños
        </SidenavItem>
        <SidenavItem icon={<DollarSignIcon />} href="/panel/monedas">
          Monedas
        </SidenavItem>
        <SidenavItem icon={<CloudIcon />} href="/panel/clientes">
          Clientes{" "}
        </SidenavItem>
        <SidenavItem icon={<ReceiptIcon />} href="/panel/reservas">
          Reservas
        </SidenavItem>
        <SidenavItem icon={<PercentCircleIcon />} href="/panel/cupones">
          Cupones{" "}
        </SidenavItem>
        <div className="bottom-0 right-0 px-5">
          <About />
        </div>
      </Sidenav>
    </div>
  );
}
