import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import { SidenavSheet } from "./sidenav-sheet";
import { UserButton } from "@clerk/nextjs";

export type AppLayoutProps = {
  children: React.ReactNode;
  title?: React.ReactNode;
  sidenav?: React.ReactNode;
};

export default function AppLayout(props: AppLayoutProps) {
  return (
    <div>
      <header className="fixed left-0 right-0 top-0 z-10 flex h-[50px] items-center border-b px-2 backdrop-blur-md md:px-4">
        <SidenavSheet
          trigger={
            <Button variant="ghost" className="md:hidden">
              <MenuIcon />
            </Button>
          }
          content={props.sidenav}
        />
        <div className="w-full">{props.title}</div>
        <div className="flex gap-4 pr-1">
          {/* <OrganizationSwitcher
            afterSelectOrganizationUrl={"/panel"}
            hidePersonal={false}
          /> */}
          <UserButton afterSwitchSessionUrl="/panel" />
        </div>
      </header>
      <aside className="fixed bottom-0 left-0 top-[50px] hidden max-h-full w-[250px] overflow-y-auto border-r md:block">
        {props.sidenav}
      </aside>
      <main className="relative mt-[50px] p-1 md:ml-[250px]">
        {props.children}
      </main>
    </div>
  );
}
