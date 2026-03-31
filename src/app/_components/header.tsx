"use client";
import ButtonCustomComponent from "~/components/buttonCustom";
import { setLang } from "../actions";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Languages } from "~/translations";
import { SidebarTrigger, useSidebar } from "~/components/ui/sidebar";

export default function Home({ lang }: { lang?: string }) {
  const t = useTranslations("HomePage");
  const { toggleSidebar } = useSidebar();

  return (
    <div>
      <div
        className="masthead inline-header center widgets large-mobile-menu-icon dt-parent-menu-clickable show-sub-menu-on-hover show-device-logo show-mobile-logo top-0"
        role="banner"
      >
        <header className="header-bar">
          <div className="branding">
            <div id="site-title" className="assistive-text">
              Bagdrop
            </div>
            <div id="site-description" className="assistive-text">
              Una solución inteligente para el guardado de equipaje
            </div>
            <a className="" href="https://bagdrop.com.ar/">
              <img
                className="preload-me"
                src="./Bag-Drop.png"
                width="100"
                height="100"
                sizes="100px"
                alt="Bagdrop"
              />
              <img
                className="mobile-logo preload-me"
                src="./Bag-Drop.png"
                width="100"
                height="100"
                sizes="100px"
                alt="Bagdrop"
              />
            </a>
          </div>

          <div className="mini-widgets">
            <div className="max-w-[140px] pl-4">
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
          </div>
        </header>
        <div className="mobile-header-bar">
          <div className="mobile-navigation"></div>
          <div className="mobile-mini-widgets">
            
          </div>
          <div className="h-20 py-2">
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

            <a className="" href="https://bagdrop.com.ar/">
              <img
                className="preload-me"
                src="./Bag-Drop.png"
                width="100"
                height="100"
                sizes="100px"
                alt="Bagdrop"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
