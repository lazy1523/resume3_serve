import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import ZkSafeWelcomeEmail from "./template/welcome";
import TwoFactorAuth from "./template/twoFactorAuth";
import ExcessWarning from "./template/excessWarning";
import { ConfigService } from "@nestjs/config";
@Injectable()
export class ResendService {
    private resend: Resend;
    constructor(private configService: ConfigService) {
        const resend_key= this.configService.get<string>('app.resend_key');
        this.resend = new Resend(resend_key);
    }
    /**
     * send welcome email
     * @param email 
     */
    async sendWelcomeEmail(to_email: string) {
        this.resend.sendEmail({
            from: 'ZkSafe<noreply@zksafe.pro>',
            to: to_email,
            subject: 'Welcome to Zksafe ',
            react: ZkSafeWelcomeEmail({userFirstname:"Zksafe"}),
        })
    }

    /**
     * 二次验证
     * @param to_email 
     * @param code 
     */
    async sendTwoFactorCode(to_email: string, code: string) {
        this.resend.sendEmail({
            from: 'ZkSafe<noreply@zksafe.pro>',
            to: to_email,
            subject: 'ZkSafe Two Factor Code',
            react: TwoFactorAuth({code:code}),
        })
    }

    /**
     * 超额提醒
     * @param to_email 
     * @param code 
     */
    async sendExcessWarning(to_email: string, code: string) {
        this.resend.sendEmail({
            from: 'ZkSafe<noreply@zksafe.pro>',
            to: to_email,
            subject: 'ZkSafe Two Factor Code',
            react: ExcessWarning({code:code}),
        })
    }
    
}