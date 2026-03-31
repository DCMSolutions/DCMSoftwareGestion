import { useTranslations } from "next-intl";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { setLang } from "~/app/actions";
import { Languages } from "~/translations";

function Item({ text, url }: { text: string; url: string }) {
  return (
    <ul className="main-nav outside-item-remove-margin">
      <li className="menu-item menu-item-type-post_type menu-item-object-page menu-item-home current-menu-item page_item page-item-11 current_page_item menu-item-27 first depth-0">
        <a href={url} data-level="1">
          <span className="menu-item-text">
            <span className="menu-text">{text}</span>
          </span>
        </a>
      </li>
    </ul>
  );
}

export function AppSidebar({ lang }: { lang?: string }) {
  const t = useTranslations("HomePage");

  return (
    <Sidebar>
      <SidebarHeader className="mt-[114px]" />
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Item text={t("home")} url="https://bagdrop.com.ar/" />
            </SidebarMenuButton>
            <SidebarMenuButton asChild>
              <Item text={t("lockers")} url="https://bagdrop.com.ar/#!/lockers" />
            </SidebarMenuButton>
            <SidebarMenuButton asChild>
              <Item
                text={t("faq")}
                url="https://bagdrop.com.ar/preguntas-frecuentes/"
              />
            </SidebarMenuButton>
            <SidebarMenuButton asChild>
              <Item text={t("contact")} url="https://bagdrop.com.ar/contacto/" />
            </SidebarMenuButton>
            <SidebarMenuButton asChild>
              <div className="mt-8 w-[80%] justify-self-center">
                <Select
                  defaultValue={lang}
                  onValueChange={(v) =>
                    setLang(v as Languages).catch(console.error)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("language")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
