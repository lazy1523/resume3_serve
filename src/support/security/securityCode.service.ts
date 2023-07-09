import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SecurityCode } from "src/models/securityCode";
import { VerifyEmailCodeDTO } from "src/modules/account/dto/verifyEmailCode.dto";

@Injectable()
export class SecurityCodeService {

    constructor(

    @InjectModel('SecurityCode')
    private securityCodeModel: Model<SecurityCode>
    ) { }

    public async createSecurityCode({ email, owner }): Promise<any> {
        const code = this.generateSecurityCode();
        const newSecurityCode = new this.securityCodeModel({ email, owner, code });
        return newSecurityCode.save();
    }

    public async verifySecurityCode(verifyEmailCodeDTO: VerifyEmailCodeDTO): Promise<Boolean> {
        const securityCode = await this.securityCodeModel.findOne({ email: verifyEmailCodeDTO.email, code: verifyEmailCodeDTO.code });
        if (securityCode) {
            await securityCode.deleteOne();
            return true;
        } else {
            return false;
        }
    }

    public async consumeSecurityCode(code: string): Promise<SecurityCode | null> {
        const securityCode = await this.securityCodeModel.findOne({ code });
        if (securityCode) {
            await securityCode.deleteOne();
            return securityCode;
        } else {
            return null;
        }
 
    }

    private generateSecurityCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
