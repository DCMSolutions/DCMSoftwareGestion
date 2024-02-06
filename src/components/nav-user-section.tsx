import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import Link from "next/link";
import { SignOut } from "./sign-in-out-buttons";
import { Badge } from "./ui/badge";
import { UserAvatarCircle } from "./user-avatar-circle";
import { About } from "./about-dialog";

export type NavUserData = {
  name?: string | null;
  image?: string | null;
  email?: string | null;
};

export default function NavUserSection(props: { user: NavUserData }) {
  return (
    <UserPopOver
      user={props.user}
      trigger={<UserAvatarCircle user={props.user} />}
    />
  );
}

export function UserPopOver(props: {
  trigger: React.ReactNode;
  user: NavUserData;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>{props.trigger}</PopoverTrigger>
      <PopoverContent className="w-80">
        <ul>
          <li>
            <Link href={"/account"} className="font-semibold">
              {props.user.name}
            </Link>
          </li>
          <li className="text-xs font-medium">
            <Link href={"/account"}>{props.user.email}</Link>
          </li>
          <li className="mb-3 mt-2 grid grid-cols-2 gap-2">
            <Badge variant="secondary" className="justify-center">
              Administrador
            </Badge>
            <Badge variant="secondary" className="justify-center">
              DCM Solution
            </Badge>
          </li>
          <li className="text-sm font-medium">
            <About />
          </li>
          <li className="text-sm font-medium">
            <SignOut />
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}
