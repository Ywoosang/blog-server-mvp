import { SocialData } from '../types/social-data.type';

export interface PassportRequest extends Request {
    user: SocialData;
}
