import nodemailer from "nodemailer"
import { Resend } from "resend"
import { getEmailSettings } from "@/lib/settings"

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
  return await sendEmail({
    to,
    subject: "欢迎使用 AI Website Tools",
    html: `
      <h1>欢迎，${name}！</h1>
      <p>感谢您注册 AI Website Tools。</p>
      <p>我们提供各种强大的在线工具，帮助您提高工作效率。</p>
      <p>立即开始探索我们的工具吧！</p>
    `,
    text: `欢迎，${name}！感谢您注册 AI Website Tools。`,
  })
}

/**
 * 发送密码重置邮件
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  return await sendEmail({
    to,
    subject: "重置您的密码",
    html: `
      <h1>重置密码</h1>
      <p>您请求重置密码。请点击下面的链接重置您的密码：</p>
      <p><a href="${resetUrl}">重置密码</a></p>
      <p>如果您没有请求重置密码，请忽略此邮件。</p>
      <p>此链接将在 1 小时后过期。</p>
    `,
    text: `重置密码：${resetUrl}`,
  })
}

/**
 * 发送邮箱验证邮件
 */
export async function sendVerificationEmail(
  to: string,
  verificationUrl: string
): Promise<{ success: boolean; error?: string }> {
  return await sendEmail({
    to,
    subject: "验证您的邮箱",
    html: `
      <h1>验证邮箱</h1>
      <p>请点击下面的链接验证您的邮箱地址：</p>
      <p><a href="${verificationUrl}">验证邮箱</a></p>
      <p>如果您没有注册账号，请忽略此邮件。</p>
    `,
    text: `验证邮箱：${verificationUrl}`,
  })
}

/**
 * 测试邮件配置
 */
export async function testEmailConnection(testEmail: string): Promise<{ success: boolean; error?: string }> {
  return await sendEmail({
    to: testEmail,
    subject: "测试邮件 - AI Website Tools",
    html: `
      <h1>测试邮件</h1>
      <p>这是一封测试邮件，用于验证邮件配置是否正确。</p>
      <p>如果您收到此邮件，说明邮件服务配置成功！</p>
    `,
    text: "这是一封测试邮件，用于验证邮件配置是否正确。",
  })
}
