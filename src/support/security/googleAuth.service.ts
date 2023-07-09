import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class GoogleAuthService {
    public generateSecret() {
        const secret = speakeasy.generateSecret({ length: 20 });
        return secret;
    }

    public generateQRCode(secret) {
        return QRCode.toDataURL(secret.otpauth_url);
    }

    public verifyToken(secret, token) {
        return speakeasy.totp.verify({ secret: secret.base32, encoding: 'base32', token: token });
    }
}
