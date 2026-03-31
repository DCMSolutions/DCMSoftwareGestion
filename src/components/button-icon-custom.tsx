import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

export default function ButtonIconCustomComponent(props: {
    onClick: () => void;
    disabled?: boolean;
    icon: React.ReactNode;
    noWFull?: boolean;
    className?: string,
  }) {
    return (
      <div>
        <Button
          className={cn(`flex ${props.noWFull ? "px-2 py-0 p-2" : "w-full"} items-center justify-center rounded-full bg-buttonPick text-sm hover:bg-buttonHover`, props.className)}
          onClick={props.onClick}
          disabled={props.disabled}
        >
          {props.icon}
        </Button>
      </div>
    );
  }