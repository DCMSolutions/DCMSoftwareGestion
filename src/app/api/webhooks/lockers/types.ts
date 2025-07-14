// const EVENTS = {
// 	TOKEN_USE: 'PeticionToken',
// 	TOKEN_USE_RESPONSE: 'RespuestaToken',
// 	lOCKER_DOOR_OPENED: 'LockerAbierto',
// 	LOCKER_DOOR_CLOSED: 'LockerCerrado',
// 	SENSOR_ACTIVATED: 'SensorOcupado',
// 	SENSOR_DEACTIVATED: 'SensorLiberado',
// 	URL_CONFIGURATION: 'ConfiguracionURL',
// 	ID_CONFIGURATION: 'ConfiguracionID',
// 	SYSTEM: 'Sistema',
// 	DEBUG: 'Debug',
// 	LOCKS_STATE: 'Cerraduras',
// 	CONNECTION: 'Conexion'
// } as const;
// export type Event = typeof EVENTS

export enum EVENTS {
	TOKEN_USE = 'PeticionToken',
	TOKEN_USE_RESPONSE = 'RespuestaToken',
	lOCKER_DOOR_OPENED = 'LockerAbierto',
	LOCKER_DOOR_CLOSED = 'LockerCerrado',
	SENSOR_ACTIVATED = 'SensorOcupado',
	SENSOR_DEACTIVATED = 'SensorLiberado',
	URL_CONFIGURATION = 'ConfiguracionURL',
	ID_CONFIGURATION = 'ConfiguracionID',
	SYSTEM = 'Sistema',
	DEBUG = 'Debug',
	LOCKS_STATE = 'Cerraduras',
	CONNECTION = 'Conexion'
}

type LockerWebhookMetadata = {
	fechaCreacion: string
	nroSerieLocker: string
	descripcion: string
}

type TokenUseData = {
	Token: string
}

export type TokenUseResponseData = {
	Token: string
	Box: number
	Respuesta: string
}

type LockerDoorAndSensorData = {
	Box: number
}

type ConfigData = {
	Viejo: string
	Nuevo: string
}

type SystemAndStateData = {
	Accion: string
}

export type LockerWebhook =
	| {
		evento: EVENTS.TOKEN_USE
		data: TokenUseData
	} & LockerWebhookMetadata
	|
	{
		evento: EVENTS.TOKEN_USE_RESPONSE
		data: TokenUseResponseData
	} & LockerWebhookMetadata

	| {
		evento: EVENTS.lOCKER_DOOR_OPENED | EVENTS.LOCKER_DOOR_CLOSED | EVENTS.SENSOR_ACTIVATED | EVENTS.SENSOR_DEACTIVATED
		data: LockerDoorAndSensorData
	} & LockerWebhookMetadata
	|
	{
		evento: EVENTS.URL_CONFIGURATION | EVENTS.ID_CONFIGURATION
		data: ConfigData
	} & LockerWebhookMetadata
	|
	{
		evento: EVENTS.SYSTEM | EVENTS.DEBUG | EVENTS.LOCKS_STATE | EVENTS.CONNECTION
		data: SystemAndStateData
	} & LockerWebhookMetadata

export type TokenRequestCreationBody = {
	idSize: number
	idBox?: number
	fechaInicio?: string
	fechaFin?: string
	confirmado?: boolean
}

export type TokenRequestEditionBody = {
	token1: string
	fechaInicio?: string
	fechaFin?: string
	confirmado?: boolean
	idBox?: number
}
