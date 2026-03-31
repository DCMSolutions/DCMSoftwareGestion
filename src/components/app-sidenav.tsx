"use client"
import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav";
import {
  AlignStartVerticalIcon,
  CloudIcon,
  CogIcon,
  DollarSignIcon,
  GroupIcon,
  ReceiptIcon,
  UserIcon,
  LayoutDashboardIcon,
  PercentCircleIcon,
  AreaChartIcon,
  BanIcon,
  Building2,
} from "lucide-react";
import { About } from "./about-dialog";
import { usePerms } from "./perms-provider";
import SelectEntidad from "./selector-entidad";

export default function AppSidenav() {
  const { isAdmin, hasPerm } = usePerms();

  return (
    <div className="text-xs">
      <Sidenav>
        <SelectEntidad />

        {isAdmin && <SidenavSeparator>Mantenimiento</SidenavSeparator>}
        {isAdmin && (
          <SidenavItem icon={<UserIcon />} href="/panel/usuarios">
            Usuarios
          </SidenavItem>
        )}
        {isAdmin && (
          <SidenavItem icon={<BanIcon />} href="/panel/roles">
            Roles
          </SidenavItem>
        )}
        {isAdmin && (
          <SidenavItem icon={<Building2 />} href="/panel/companies">
            Entidades
          </SidenavItem>
        )}
        {/* {isAdmin && (
          <SidenavItem icon={<KeyRound />} disabled={true}>
            Permisos
          </SidenavItem>
        )} */}
        {isAdmin && (
          <SidenavItem
            icon={<AreaChartIcon />}
            disabled={false}
            href="/panel/reportes"
          >
            Reportes
          </SidenavItem>
        )}{" "}
        {isAdmin && <SidenavItem icon={<CloudIcon />} href="/panel/ciudades">
          Ciudades{" "}
        </SidenavItem>}
        {isAdmin && <SidenavItem icon={<DollarSignIcon />} href="/panel/monedas">
          Monedas
        </SidenavItem>}
        <SidenavSeparator>Administración</SidenavSeparator>
        {hasPerm("panel:params") && <SidenavItem
          icon={<CogIcon />}
          disabled={false}
          href="/panel/parametros"
        >
          Parámetros
        </SidenavItem>}
        {hasPerm("panel:monitor") && <SidenavItem icon={<LayoutDashboardIcon />} href="/panel/monitor">
          Monitor
        </SidenavItem>}
        {hasPerm("panel:locales") && <SidenavItem icon={<AlignStartVerticalIcon />} href="/panel/locales">
          Locales
        </SidenavItem>}
        {hasPerm("panel:sizes") && <SidenavItem icon={<GroupIcon />} href="/panel/tamanos">
          Tamaños
        </SidenavItem>}
        {hasPerm("panel:clientes") && <SidenavItem icon={<CloudIcon />} href="/panel/clientes">
          Clientes{" "}
        </SidenavItem>}
        {hasPerm("panel:reservas") && <SidenavItem icon={<ReceiptIcon />} href="/panel/reservas">
          Reservas
        </SidenavItem>}
        {hasPerm("panel:cupones") && <SidenavItem icon={<PercentCircleIcon />} href="/panel/cupones">
          Cupones{" "}
        </SidenavItem>}
        <div className="bottom-0 right-0 px-5">
          <About />
        </div>
      </Sidenav>
    </div>
  );
}
