import nodemailer from 'nodemailer'
import { env } from '../../config/env.js'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  }
  return transporter
}

export async function sendWelcomeEmail(to: string, name: string, email: string, password: string) {
  const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 20px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#059669;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">¡Bienvenido a RestoPro Enterprise!</h1>
    </div>
    <div style="padding:32px">
      <p style="font-size:15px;color:#333">Hola <strong>${name}</strong>,</p>
      <p style="font-size:14px;color:#555">Tu cuenta ha sido creada exitosamente. Estas son tus credenciales de acceso:</p>
      <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0">
        <p style="margin:4px 0;font-size:14px;color:#333"><strong>URL:</strong> <a href="${frontendUrl}" style="color:#059669">${frontendUrl}</a></p>
        <p style="margin:4px 0;font-size:14px;color:#333"><strong>Usuario:</strong> ${email}</p>
        <p style="margin:4px 0;font-size:14px;color:#333"><strong>Contraseña:</strong> <code style="background:#e5e7eb;padding:2px 8px;border-radius:4px;font-size:15px">${password}</code></p>
      </div>
      <p style="font-size:13px;color:#777">Recomendamos cambiar la contraseña después de tu primer inicio de sesión desde la sección <em>Mi Perfil</em>.</p>
      <div style="text-align:center;margin-top:28px">
        <a href="${frontendUrl}/login" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600">Iniciar Sesión</a>
      </div>
    </div>
    <div style="background:#f3f4f6;padding:16px;text-align:center;font-size:11px;color:#999">
      RestoPro Enterprise — Plataforma SaaS para Gestión de Restaurantes
    </div>
  </div>
</body>
</html>`

  try {
    const info = await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'Bienvenido a RestoPro Enterprise — Tus Credenciales de Acceso',
      html,
    })
    console.log(`[Email] Welcome sent to ${to} (id: ${info.messageId})`)
    return true
  } catch (err) {
    console.warn(`[Email] Failed to send welcome to ${to}:`, (err as Error).message)
    return false
  }
}

export async function sendCredentialsEmail(to: string, email: string, password: string) {
  const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 20px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#059669;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">Acceso a RestoPro Enterprise</h1>
    </div>
    <div style="padding:32px">
      <p style="font-size:14px;color:#555">Se han generado nuevas credenciales para tu cuenta:</p>
      <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0">
        <p style="margin:4px 0;font-size:14px;color:#333"><strong>URL:</strong> <a href="${frontendUrl}" style="color:#059669">${frontendUrl}</a></p>
        <p style="margin:4px 0;font-size:14px;color:#333"><strong>Usuario:</strong> ${email}</p>
        <p style="margin:4px 0;font-size:14px;color:#333"><strong>Contraseña:</strong> <code style="background:#e5e7eb;padding:2px 8px;border-radius:4px;font-size:15px">${password}</code></p>
      </div>
      <div style="text-align:center;margin-top:28px">
        <a href="${frontendUrl}/login" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600">Iniciar Sesión</a>
      </div>
    </div>
  </div>
</body>
</html>`

  try {
    const info = await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'RestoPro Enterprise — Credenciales de Acceso',
      html,
    })
    console.log(`[Email] Credentials sent to ${to} (id: ${info.messageId})`)
    return true
  } catch (err) {
    console.warn(`[Email] Failed to send credentials to ${to}:`, (err as Error).message)
    return false
  }
}
