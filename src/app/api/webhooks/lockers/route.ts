import { NextRequest, NextResponse } from "next/server";
import { EVENTS, type TokenUseResponseData, type LockerWebhook, type TokenRequestCreationBody, type TokenRequestEditionBody } from "./types";
import { db } from "~/server/db";
import { Reserve } from "~/server/api/routers/reserves";
import { reservas, stores, storesLockers } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { addTokenToServer, editTokenToServer, isWithinDates, sendAfterFirstUseEmail, sendGoodbyeEmail } from "./helpers";
import { env } from "~/env";

const bearer_token = env.TOKEN_EMPRESA

export async function POST(request: NextRequest) {
	const webhook: LockerWebhook = await request.json()
	console.log(webhook)
	if (webhook.evento === EVENTS.TOKEN_USE_RESPONSE) {
		const webhookData: TokenUseResponseData = JSON.parse((webhook.data as unknown) as string)

		if (webhookData.Respuesta === 'Aceptado') {
			const lockerReservations: Reserve[] = await db.select().from(reservas).where(eq(reservas.NroSerie, webhook.nroSerieLocker))
			let reservation = lockerReservations.find(reservation =>
				reservation.Token2 === parseInt(webhookData.Token) && isWithinDates(reservation.FechaInicio!, reservation.FechaFin!))
			const tokenUsedIsToken2 = !!reservation
			if (tokenUsedIsToken2) {
				console.log('Uso de token de usuario de la reserva:')
				console.log(reservation)
				// Evitar el reenviado de mail y cambiarle fecha fin al tiempo extra configurado
				await sendGoodbyeEmail({ to: reservation!.client! })
				return NextResponse.json({ status: 200 })
			}

			reservation = lockerReservations.find(reservation =>
				reservation.Token1 === parseInt(webhookData.Token) && isWithinDates(reservation.FechaInicio!, reservation.FechaFin!))
			if (reservation?.Token2) {
				console.log('Uso repetido de token de repartidor de la reserva:')
				console.log(reservation)
				return NextResponse.json({ status: 200 })
			}
			await db.update(reservas).set({ IdFisico: webhookData.Box }).where(eq(reservas.identifier, reservation?.identifier!))
			console.log(reservation)

			const webhookEventTime = new Date(webhook.fechaCreacion)
			const tokenUseExtraTimeDbResult = await db.select({ tokenUseExtraTime: stores.firstTokenUseTime }).from(stores)
				.innerJoin(storesLockers, eq(stores.identifier, storesLockers.storeId))
				.where(eq(storesLockers.serieLocker, webhook.nroSerieLocker))
			const { tokenUseExtraTime } = tokenUseExtraTimeDbResult[0]!
			webhookEventTime.setMinutes(webhookEventTime.getMinutes() + tokenUseExtraTime! - (180))
			let newLimit = webhookEventTime.toISOString().split('.')[0]

			const tokenEditBody: TokenRequestEditionBody = {
				token1: reservation?.Token1!.toString()!,
				fechaFin: newLimit,
				idBox: -1,
			}
			const editToken1Response = await editTokenToServer(tokenEditBody, webhook.nroSerieLocker, bearer_token)
			if (!editToken1Response.ok) {
				console.log('No se pudo editar el token de repartidor')
				const error = await editToken1Response.text()
				console.log(error)
			}
			webhookEventTime.setSeconds(webhookEventTime.getSeconds() + 10)
			const newTokenStartTime = webhookEventTime.toISOString().split('.')[0]
			webhookEventTime.setMinutes(webhookEventTime.getMinutes() + tokenUseExtraTime!)
			const newTokenEndTime = webhookEventTime.toISOString().split('.')[0]
			const newToken: TokenRequestCreationBody = {
				idSize: reservation?.IdSize!,
				idBox: webhookData.Box!,
				fechaInicio: newTokenStartTime,
				fechaFin: newTokenEndTime,
				confirmado: true
			}
			console.log('Token de usuario a crear: ', newToken)
			const token2CreationResponse = await addTokenToServer(newToken, webhook.nroSerieLocker, bearer_token)
			if (!token2CreationResponse.ok) {
				const token2CreationError = await token2CreationResponse.text()
				console.log('No se pudo crear el token de usuario')
				console.log('error message: ', token2CreationError)
				return NextResponse.json({ status: 200 })
			}
			const token2 = await token2CreationResponse.text()
			console.log('Successfully created token ', token2)
			await db.update(reservas).set({ Token2: parseInt(token2) }).where(eq(reservas.identifier, reservation?.identifier!))
			const lockerAddressDbResult = await db.select({ lockerAddress: stores.address }).from(stores)
				.innerJoin(storesLockers, eq(stores.identifier, storesLockers.storeId))
				.where(eq(storesLockers.serieLocker, webhook.nroSerieLocker))
			const { lockerAddress } = lockerAddressDbResult[0]!
			await sendAfterFirstUseEmail({
				to: reservation?.client!,
				checkoutTime: reservation?.FechaFin!,
				userToken: token2,
				lockerAddress: lockerAddress!
			})
		}
	}
	return NextResponse.json({ status: 200 })
}
