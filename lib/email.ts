import nodemailer from "nodemailer"
import { Resend } from "resend"
import { getEmailSettings, getSiteInfo } from "@/lib/settings"

/**
 * 邮件发送接口
 */
export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

/**
 * 发送邮件
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const settings = await getEmailSettings()
  const siteInfo = await getSiteInfo()

  // 如果发件人名称为空，使用网站名称
  if (!settings.smtpFromName) {
    settings.smtpFromName = siteInfo.siteName
  }

  if (!settings.enabled) {
    console.warn("Email is disabled in settings")
    return { success: false, error: "Email service is disabled" }
  }

  try {
    switch (settings.provider) {
      case "smtp":
        return await sendEmailViaSMTP(options, settings)
      case "resend":
        return await sendEmailViaResend(options, settings)
      case "sendgrid":
        return await sendEmailViaSendGrid(options, settings)
      default:
        return { success: false, error: "Invalid email provider" }
    }
  } catch (error: any) {
    console.error("Failed to send email:", error)
    return { success: false, error: error.message || "Failed to send email" }
  }
}

/**
 * 通过 SMTP 发送邮件
 */
async function sendEmailViaSMTP(
  options: EmailOptions,
  settings: Awaited<ReturnType<typeof getEmailSettings>>
): Promise<{ success: boolean; error?: string }> {
  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
    return { success: false, error: "SMTP not configured" }
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: parseInt(settings.smtpPort),
    secure: settings.smtpSecure,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPassword,
    },
    tls: {
      rejectUnauthorized: false, // 允许自签名证书
    },
    connectionTimeout: 10000, // 10秒连接超时
    greetingTimeout: 10000,   // 10秒问候超时
    socketTimeout: 10000,     // 10秒套接字超时
  })

  try {
    await transporter.sendMail({
      from: options.from || `"${settings.smtpFromName}" <${settings.smtpFromEmail}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 通过 Resend 发送邮件
 */
async function sendEmailViaResend(
  options: EmailOptions,
  settings: Awaited<ReturnType<typeof getEmailSettings>>
): Promise<{ success: boolean; error?: string }> {
  if (!settings.resendApiKey) {
    return { success: false, error: "Resend API key not configured" }
  }

  const resend = new Resend(settings.resendApiKey)

  try {
    await resend.emails.send({
      from: options.from || `${settings.smtpFromName} <${settings.smtpFromEmail}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 通过 SendGrid 发送邮件
 */
async function sendEmailViaSendGrid(
  options: EmailOptions,
  settings: Awaited<ReturnType<typeof getEmailSettings>>
): Promise<{ success: boolean; error?: string }> {
  if (!settings.sendgridApiKey) {
    return { success: false, error: "SendGrid API key not configured" }
  }

  try {
    const sgMail = require("@sendgrid/mail")
    sgMail.setApiKey(settings.sendgridApiKey)

    await sgMail.send({
      from: options.from || `${settings.smtpFromName} <${settings.smtpFromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 发送欢迎邮件
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<{ success: boolean; error?: string }> {
  const siteInfo = await getSiteInfo()
  return await sendEmail({
    to,
    subject: `Welcome to ${siteInfo.siteName}`,
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for registering with ${siteInfo.siteName}.</p>
      <p>${siteInfo.siteDescription}</p>
      <p>Start exploring our tools now!</p>
    `,
    text: `Welcome, ${name}! Thank you for registering with ${siteInfo.siteName}.`,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  const siteInfo = await getSiteInfo()
  return await sendEmail({
    to,
    subject: `Reset Your Password - ${siteInfo.siteName}`,
    html: `
      <h1>Reset Password</h1>
      <p>You requested to reset your password for your account at ${siteInfo.siteName}. Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <br/>
      <p>Best regards,</p>
      <p>The ${siteInfo.siteName} Team</p>
    `,
    text: `Reset Password: ${resetUrl}`,
  })
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  to: string,
  verificationUrl: string
): Promise<{ success: boolean; error?: string }> {
  const siteInfo = await getSiteInfo()
  return await sendEmail({
    to,
    subject: `Verify Your Email - ${siteInfo.siteName}`,
    html: `
      <h1>Verify Email</h1>
      <p>Welcome to ${siteInfo.siteName}! Please click the link below to verify your email address:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>If you did not register an account, please ignore this email.</p>
      <br/>
      <p>Best regards,</p>
      <p>The ${siteInfo.siteName} Team</p>
    `,
    text: `Verify Email: ${verificationUrl}`,
  })
}

/**
 * Test email configuration
 */
export async function testEmailConnection(testEmail: string): Promise<{ success: boolean; error?: string }> {
  const siteInfo = await getSiteInfo()
  return await sendEmail({
    to: testEmail,
    subject: `Test Email - ${siteInfo.siteName}`,
    html: `
      <h1>Test Email</h1>
      <p>This is a test email to verify that the email configuration is correct.</p>
      <p>If you received this email, the email service is configured successfully!</p>
    `,
    text: "This is a test email to verify that the email configuration is correct.",
  })
}
