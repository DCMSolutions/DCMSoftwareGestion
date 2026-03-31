import Link from "next/link";
import { Badge } from "./ui/badge";

export default function Sidenav(props: { children: React.ReactNode }) {
  return <ul>{props.children}</ul>;
}

export function SidenavSeparator(props: { children: React.ReactNode }) {
  return <li className="px-4 pt-2 text-sm font-medium">{props.children}</li>;
}

export function SidenavItem(props: {
  icon: React.ReactNode;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  if (!props.disabled || props.disabled == undefined) {
    const className = `w-full flex gap-2 px-3 py-1 items-center
    hover:bg-stone-100 dark:hover:bg-stone-900
    active:bg-stone-200 dark:active:bg-stone-800`;

    const content = (
      <>
        <div className="items-center justify-center p-1">{props.icon}</div>
        <p className="text block w-full text-left font-medium">
          {props.children}
        </p>
      </>
    );

    if (props.href) {
      return (
        <li>
          <Link href={props.href} className={className}>
            {content}
          </Link>
        </li>
      );
    }

    return (
      <li>
        <button className={className} onClick={props.onClick}>
          {content}
        </button>
      </li>
    );
  } else {
    const className = `w-full flex gap-2 px-3 py-1 items-center
    opacity-75`;

    const content = (
      <>
        <div className="items-center justify-center p-1">{props.icon}</div>
        <p className="text block w-full text-left font-medium">
          {props.children}
        </p>
        <Badge variant="outline" className="border-slate-300 bg-slate-200">
          Próximamente
        </Badge>
      </>
    );

    return (
      <li>
        <button className={className} onClick={props.onClick}>
          {content}
        </button>
      </li>
    );
  }
}
