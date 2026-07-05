import nodemailer from 'nodemailer';
import logger from '../utils/logger';

// Create a reusable transporter object using the default SMTP transport
// Using Ethereal Email for testing purposes. 
// In production, you would use a real SMTP service (SendGrid, Mailgun, etc.) and configure it via process.env
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
        user: process.env.SMTP_USER || 'karen.hansen47@ethereal.email',
        pass: process.env.SMTP_PASS || '65fMyQG96YtK9xY9f4'
    }
});

export const sendPasswordResetEmail = async (to: string, resetCode: string) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || '"Sinerji Platform" <noreply@sinerji.com>',
            to,
            subject: 'Sinerji - Şifre Sıfırlama Kodu',
            text: `Şifre sıfırlama kodunuz: ${resetCode}\n\nBu kod 15 dakika boyunca geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı dikkate almayınız.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px; text-align: center;">
                    <h2 style="color: #004d40;">Sinerji Platformu</h2>
                    <p style="font-size: 16px; color: #333;">Şifre sıfırlama talebinde bulundunuz.</p>
                    <p style="font-size: 16px; color: #333;">Güvenlik kodunuz:</p>
                    <div style="margin: 20px auto; padding: 15px; background-color: #f4f4f4; border-radius: 8px; display: inline-block; letter-spacing: 5px; font-size: 24px; font-weight: bold; color: #e28743;">
                        ${resetCode}
                    </div>
                    <p style="font-size: 14px; color: #777;">Bu kod 15 dakika boyunca geçerlidir.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #aaa;">Eğer bu talebi siz yapmadıysanız lütfen bu e-postayı görmezden gelin.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        
        logger.info(`Password reset email sent to ${to}`);
        // Log the preview URL so the user can click it in the terminal during development!
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        
        return true;
    } catch (error) {
        logger.error(`Error sending email to ${to}:`, error);
        return false;
    }
};
