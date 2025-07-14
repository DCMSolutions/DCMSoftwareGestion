import { NextRequest, NextResponse } from "next/server";
import { EVENTS, type TokenUseResponseData, type LockerWebhook, TokenRequestCreationBody, TokenRequestEditionBody } from "./types";
import { db } from "~/server/db";
import { Reserve } from "~/server/api/routers/reserves";
import { lockers, reservas, stores, storesLockers } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { addTokenToServer, editTokenToServer, sendAfterFirstUseEmail, sendGoodbyeEmail } from "./helpers";

const bearer_token = 'xkg3tQKqSu1PvaldmTmKR'
const locker_serial = 'TEST-IAN'

export async function POST(request: NextRequest) {
	const wh: LockerWebhook = await request.json()
	console.log(wh)
	if (wh.evento === EVENTS.TOKEN_USE_RESPONSE) {
		const whData: TokenUseResponseData = JSON.parse((wh.data as unknown) as string)
		if (whData.Respuesta === 'Aceptado') {
			const lockerReservations: Reserve[] = await db.select().from(reservas).where(eq(reservas.NroSerie, wh.nroSerieLocker))
			let reservation = lockerReservations.find(reservation => reservation.Token2 === parseInt(whData.Token))
			if (reservation) {
				await sendGoodbyeEmail({ to: reservation.client! })
				return NextResponse.json({ status: 200 })
			}
			reservation = lockerReservations.find(reservation => reservation.Token1 === parseInt(whData.Token))
			await db.update(reservas).set({ IdBox: whData.Box }).where(eq(reservas.identifier, reservation?.identifier!))
			console.log(reservation)
			if (reservation?.Token2) {
				return NextResponse.json({ status: 200 })
			}
			const webhookEventTime = new Date(wh.fechaCreacion)
			const tokenUseExtraTimeDbResult = await db.select({ minutes: stores.firstTokenUseTime }).from(stores)
				.innerJoin(storesLockers, eq(stores.identifier, storesLockers.storeId))
				.where(eq(storesLockers.serieLocker, wh.nroSerieLocker))
			const { minutes: tokenUseExtraTime } = tokenUseExtraTimeDbResult[0]!
			webhookEventTime.setMinutes(webhookEventTime.getMinutes() + tokenUseExtraTime! - (180))
			let newLimit = webhookEventTime.toISOString().split('.')[0]
			console.log(newLimit)
			const tokenEditBody: TokenRequestEditionBody = {
				token1: reservation?.Token1!.toString()!,
				fechaFin: newLimit,
				idBox: -1,
			}
			const editToken1Response = await editTokenToServer(tokenEditBody, locker_serial, bearer_token)
			if (!editToken1Response.ok) {
				console.log('No se pudo editar la fecha fin del token de primer uso sumándole 15 minutos')
				const error = await editToken1Response.text()
				console.log(error)
			}
			webhookEventTime.setSeconds(webhookEventTime.getSeconds() + 10)
			const newTokenStartTime = webhookEventTime.toISOString().split('.')[0]
			const newToken: TokenRequestCreationBody = {
				idSize: reservation?.IdSize!,
				idBox: whData.Box!,
				fechaInicio: newTokenStartTime,
				fechaFin: reservation?.FechaFin!,
				confirmado: true
			}
			console.log(newToken)
			const token2Response = await addTokenToServer(newToken, locker_serial, bearer_token)
			if (!token2Response.ok) {
				const token2 = await token2Response.text()
				console.log(token2)
			} else {
				const token2 = await token2Response.text()
				console.log(token2)
				await sendAfterFirstUseEmail({
					to: reservation?.client!,
					checkoutTime: reservation?.FechaFin!,
					userToken: token2,
					lockerAddress: reservation?.NroSerie!
				})
				await db.update(reservas).set({ Token2: parseInt(token2) }).where(eq(reservas.identifier, reservation?.identifier!))
			}
		}
	}
	return NextResponse.json({ status: 200 })
}
