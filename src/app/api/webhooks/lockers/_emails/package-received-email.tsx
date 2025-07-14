import { Html } from "@react-email/components"
import { ReactNode } from "react"

export default function PackageReceivedEmail({ lockerAddress, checkoutTime, userToken }: { lockerAddress: string, checkoutTime: string, userToken: string }): ReactNode {
	return (
		<Html lang="es">
			<body>

				<p>El paquete destinado a su locker reservado en ${lockerAddress} fue entregado. Le recordamos que el tiempo límite para pasarlo a buscar es ${checkoutTime}</p>

				<p><strong>Su código de acceso (Token) para el locker que contiene su paquete es ${userToken}</strong></p>

				<p>Atentamente,</p>
				<p>el equipo de <strong>PickPack</strong></p>

			</body>
		</Html>
	)
}
