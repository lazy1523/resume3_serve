import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import ZkSafeWelcomeEmail from "./template/welcome";
import TwoFactorAuth from "./template/TwoFactorAuth";
import ExcessWarning from "./template/ExcessWarning";
@Injectable()
export class ResendService {
    private resend: Resend;
    constructor() {
        this.resend = new Resend(process.env.RESEND_KEY);
    }
    /**
     *  send welcome email
     * @param email 
     */
    async sendWelcomeEmail(to_email: string) {
        this.resend.sendEmail({
            from: 'ZkSafe<noreply@zksafe.pro>',
            to: to_email,
            subject: 'Welcome to Zksafe',
            react: ZkSafeWelcomeEmail({userFirstname:"Zksafe"}),
        })
    }

    async sendTwoFactorCode(to_email: string, code: string) {
        this.resend.sendEmail({
            from: 'ZkSafe<noreply@zksafe.pro>',
            to: to_email,
            subject: 'ZkSafe Two Factor Code',
            react: TwoFactorAuth({code:code}),
        })
    }
    async sendExcessWarning(to_email: string, code: string) {
        this.resend.sendEmail({
            from: 'ZkSafe<noreply@zksafe.pro>',
            to: to_email,
            subject: 'ZkSafe Two Factor Code',
            react: ExcessWarning({code:code}),
        })
    }
    
}