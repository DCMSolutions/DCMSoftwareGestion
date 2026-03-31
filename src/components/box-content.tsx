import { Locker } from "~/server/api/routers/lockers";
import { Reserves } from "~/server/api/routers/reserves";
import { MonitorDatatable } from "./monitor-table";
import { Size } from "~/server/api/routers/sizes";
export default async function BoxContent(props: {
  locker: Locker;
  reservas: Reserves[] | null;
  sizes: Size[];
}) {
  const { reservas, sizes } = props;

  return (
    <div>
      <MonitorDatatable data={props.locker} reservas={reservas} sizes={sizes} />
    </div>
  );
}
