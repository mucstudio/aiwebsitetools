import nodemailer from 'nodemailer'
import { prisma } from './prisma'
import { decrypt } from './encryption'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Get site config with SMTP settings
    const config = await prisma.siteConfig.findFirst()

    if (!config || !config.smtpHost || !config.smtpUser || !config.smtpPassword) {
      console.error('SMTP configuration is incomplete')
      return false
    }

    // Decrypt SMTP password
    const smtpPassword = decrypt(config.smtpPassword)

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort || 587,
      secure: config.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: config.smtpUser,
        pass: smtpPassword
      }
    })

    // Send email
    await transporter.sendMail({
      from: `"${config.smtpFromName || config.siteName}" <${config.smtpFrom || config.smtpUser}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    })

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export async function sendVerificationEmail(email: string, token: string, siteName: string, siteUrl: string): Promise<boolean> {
  const verificationUrl = `${siteUrl}/verify-email?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    ${siteName}
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                    Verify Your Email Address
                  </h2>

                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                    Thank you for registering with ${siteName}! To complete your registration and start using our tools, please verify your email address by clicking the button below.
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>

                  <p style="margin: 10px 0 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                    ${verificationUrl}
                  </p>

                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;">

                  <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
                    If you didn't create an account with ${siteName}, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} ${siteName}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const text = `
    Verify Your Email Address

    Thank you for registering with ${siteName}!

    To complete your registration, please verify your email address by visiting this link:
    ${verificationUrl}

    If you didn't create an account with ${siteName}, you can safely ignore this email.

    © ${new Date().getFullYear()} ${siteName}. All rights reserved.
  `

  return sendEmail({
    to: email,
    subject: `Verify your email address - ${siteName}`,
    html,
    text
  })
}

export async function sendPasswordResetEmail(email: string, token: string, siteName: string, siteUrl: string): Promise<boolean> {
  const resetUrl = `${siteUrl}/reset-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    ${siteName}
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                    Reset Your Password
                  </h2>

                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                    We received a request to reset your password. Click the button below to create a new password.
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>

                  <p style="margin: 10px 0 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                    ${resetUrl}
                  </p>

                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;">

                  <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                  </p>

                  <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px;">
                    This link will expire in 1 hour.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} ${siteName}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const text = `
    Reset Your Password

    We received a request to reset your password for ${siteName}.

    To reset your password, visit this link:
    ${resetUrl}

    If you didn't request a password reset, you can safely ignore this email.
    This link will expire in 1 hour.

    © ${new Date().getFullYear()} ${siteName}. All rights reserved.
  `

  return sendEmail({
    to: email,
    subject: `Reset your password - ${siteName}`,
    html,
    text
  })
}
