import { TokenRequestCreationBody, TokenRequestEditionBody } from "./types";
import sendgrid from "@sendgrid/mail"
import { Html, render } from "@react-email/components"
import QRCode from "qrcode";
import { env } from "~/env";

const base_url = 'https://testing.server.dcm.com.ar/api/v2/token'

export async function addTokenToServer(token: TokenRequestCreationBody, lockerSerial: string, bearerToken: string) {
	const response = await fetch(`${base_url}/${lockerSerial}`,
		{
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${bearerToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(token)
		});
	return response
}

export async function editTokenToServer(token: TokenRequestEditionBody, lockerSerial: string, bearerToken: string) {
	const response = await fetch(`${base_url}/${lockerSerial}`,
		{
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${bearerToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(token)
		});
	return response
}

export async function sendAfterFirstUseEmail({ to, lockerAddress, checkoutTime, userToken }: { to: string, lockerAddress: string, checkoutTime: string, userToken: string }) {

	// const qrCode = await QRCode.toDataURL(userToken);
	const fechaFin = checkoutTime.split('T')[0]
	const horaFin = checkoutTime.split('T')[1]
	sendgrid.setApiKey(env.SENDGRID_API_KEY);
	const msg = {
		to,
		from: env.MAIL_SENDER,
		subject: 'PICKPACK: Paquete listo para ser recogido',
		html: `
			<body>

				<p>El paquete destinado a su locker reservado en ${lockerAddress} fue entregado. Le recordamos que el tiempo límite para pasarlo a buscar es ${horaFin} del ${fechaFin}</p>

				<p><strong>Su código de acceso (Token) para el locker que contiene su paquete es ${userToken}</strong></p>

				<p>Atentamente,</p>
				<p>el equipo de <strong>PickPack</strong></p>

			</body>`
		// attachments: [
		// 	{
		// 		filename: `${userToken}.png`,
		// 		content: qrCode,
		// 		type: 'image/png',
		// 		disposition: 'attachment'
		// 	}
		// ],
	};
	sendgrid.send(msg)
		.then(() => {
			console.log("Email sent");
		})
		.catch((e: any) => {
			console.log(e);
		});
}

export async function sendGoodbyeEmail({ to }: { to: string }) {

	// const qrCode = await QRCode.toDataURL(userToken);

	sendgrid.setApiKey(env.SENDGRID_API_KEY);
	const msg = {
		to,
		from: env.MAIL_SENDER,
		subject: 'PICKPACK: paquete recogido',
		html: `
			<body>

				<p>Gracias por confiar en <strong>PickPack</strong>, esperamos que nuestro servicio haya sido de su agrado.</p>

				<p>Atentamente,</p>
				<p>el equipo de <strong>PickPack</strong></p>

			</body>`
		// attachments: [
		// 	{
		// 		filename: `${userToken}.png`,
		// 		content: qrCode,
		// 		type: 'image/png',
		// 		disposition: 'attachment'
		// 	}
		// ],
	};
	sendgrid.send(msg)
		.then(() => {
			console.log("Email sent");
		})
		.catch((e: any) => {
			console.log(e);
		});
}
