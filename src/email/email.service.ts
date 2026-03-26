import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BrevoClient } from '@getbrevo/brevo';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private brevoClient: BrevoClient;

    constructor(private configService: ConfigService) {
        this.brevoClient = new BrevoClient({
            apiKey: this.configService.get<string>('BREVO_API_KEY')!,
        });
    }

    async sendVerificationEmail(to: string, name: string, token: string) {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const senderEmail = this.configService.get<string>('SENDER_EMAIL')!;
        const url = `${frontendUrl}/auth/verify?token=${token}`;

        const htmlContent = `
      <div style="background-color: #f4f7f6; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <div style="background-color: #1a73e8; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px;">
              🎓 UFM CONNECT
            </h1>
          </div>

          <div style="padding: 40px 30px; color: #333333; line-height: 1.6;">
            <p style="font-size: 16px;">Xin chào <strong>${name}</strong>,</p>
            <p>Chào mừng bạn đến với <strong>UFM Connect</strong> - Nền tảng kết nối học tập, quản lý tài chính và định hướng nghề nghiệp toàn diện dành cho sinh viên.</p>
            <p>Vui lòng bấm vào nút bên dưới để xác thực địa chỉ email và kích hoạt tài khoản của bạn:</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${url}" style="background-color: #1a73e8; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                KÍCH HOẠT TÀI KHOẢN
              </a>
            </div>

            <p style="font-size: 14px; color: #666;">
              <em>*Link xác thực này sẽ hết hạn sau 24 giờ.</em>
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eeeeee;">
            <p style="margin: 0;">Bạn nhận được email này vì đã đăng ký tài khoản tại hệ thống UFM Connect.</p>
            <p style="margin: 5px 0;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
          </div>

        </div>
      </div>
    `;

        try {
            await this.brevoClient.transactionalEmails.sendTransacEmail({
                subject: '🎓 Kích hoạt tài khoản UFM Connect',
                htmlContent: htmlContent,
                sender: { name: 'UFM Connect', email: senderEmail },
                to: [{ email: to }],
            });
            this.logger.log(`📧 Email sent successfully to ${to}`);
        } catch (error) {
            this.logger.error('Error sending email:', error);
            throw new Error('Không thể gửi email xác thực');
        }
    }

    async sendResetPasswordEmail(to: string, name: string, token: string) {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const senderEmail = this.configService.get<string>('SENDER_EMAIL')!;
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        const htmlContent = `
      <div style="background-color: #f4f7f6; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <div style="background-color: #1a73e8; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px;">
              🎓 UFM CONNECT
            </h1>
          </div>

          <div style="padding: 40px 30px; color: #333333; line-height: 1.6;">
            <h2 style="color: #1a73e8; text-align: center; margin-top: 0;">Yêu cầu đặt lại mật khẩu 🔑</h2>
            <p style="font-size: 16px;">Xin chào <strong>${name}</strong>,</p> <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>UFM Connect</strong>.</p>
            <p>Vui lòng bấm vào nút bên dưới để tiến hành tạo mật khẩu mới:</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetLink}" style="background-color: #1a73e8; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                ĐẶT LẠI MẬT KHẨU
              </a>
            </div>

            <p style="font-size: 14px; color: #666;">
              <em>*Link khôi phục này sẽ hết hạn sau 15 phút.</em>
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eeeeee;">
            <p style="margin: 0;">Bạn nhận được email này vì có yêu cầu khôi phục mật khẩu.</p>
            <p style="margin: 5px 0;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này để đảm bảo an toàn.</p>
          </div>

        </div>
      </div>
    `;

        try {
            await this.brevoClient.transactionalEmails.sendTransacEmail({
                subject: '🎓 [UFM Connect] Đặt lại mật khẩu',
                htmlContent: htmlContent,
                sender: { name: 'UFM Connect', email: senderEmail },
                to: [{ email: to }],
            });
            this.logger.log(`📧 Reset password email sent successfully to ${to}`);
        } catch (error) {
            this.logger.error('Error sending reset password email:', error);
            throw new Error('Không thể gửi email khôi phục');
        }
    }
}