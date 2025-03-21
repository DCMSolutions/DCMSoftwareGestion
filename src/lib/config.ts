export const PublicConfigClaves = {
  "metodo_pago": "Configuración de método de pago",
  "mercadopago_public_key": "Clave pública de Mercado Pago",
}

export enum PublicConfigMetodoPago {
  mercadopago = "mercadopago",
  mobbex = "mobbex"
}

export type PublicConfigMetodoPagoKeys = keyof typeof PublicConfigMetodoPago;
export type PublicConfigKeys = keyof typeof PublicConfigClaves;

export const PrivateConfigClaves = {
  "mercadopago_private_key": "Clave privada de Mercado Pago",
  "mobbex_api_key": "Clave API de Mobbex",
  "mobbex_access_token": "Token de acceso de Mobbex",
}

export type PrivateConfigKeys = keyof typeof PrivateConfigClaves;
