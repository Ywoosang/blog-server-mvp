import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class GravatarService {
    getGravatarUrl(email: string, size: number = 200): string {
        const md5EmailHash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');

        return `https://www.gravatar.com/avatar/${md5EmailHash}?s=${size}&d=retro`;
    }
}
