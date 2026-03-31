# Guía para configurar MP

- Hacer integración en developers mercadopago con Checkout Pro
- Configurar webhook con context /api/mp-pago, ejemplo: https://testing-dcm-software-gestion.vercel.app/api/mp-pago
- Configurar en parámetros del panel: clave privada, clave pública, clave secreta de webhook (el previamente configurado) y url de webhook
- OJO: el url de webhook en parámetros del panel no debe incluir el context, ejemplo: https://testing-dcm-software-gestion.vercel.app/