import { ChevronRightIcon } from "lucide-react";
import { Icon } from "next/dist/lib/metadata/types/metadata-types";
import { Button } from "~/components/ui/button";

export default function ButtonCustomComponent(props: {
  onClick: () => void;
  text: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  after?: boolean;
}) {
  return (
    <div>
      <Button
        className="flex w-full items-center justify-center rounded-full bg-buttonPick text-sm hover:bg-buttonHover"
        onClick={props.onClick}
        disabled={props.disabled}
      >
        {!props.after && props.icon && (
          <span className="mr-2">{props.icon}</span>
        )}
        {props.text}
        {props.after && props.icon && (
          <span className="ml-1">{props.icon}</span>
        )}
      </Button>
    </div>
  );
}
