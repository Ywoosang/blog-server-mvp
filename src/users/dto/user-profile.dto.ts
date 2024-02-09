import { Exclude, Expose } from 'class-transformer';
import { UsersRole } from '../users-role.enum';
import { UsersStatus } from '../users-status.enum';

@Expose()
export class UserProfileDto {
    id: number;
    email: string;
    userLoginId: string;
    nickname: string;
    profileImage: string;
    description: string;
    status: UsersStatus;
    role: UsersRole;

    @Exclude()
    password: string;

    @Exclude()
    refreshToken: string;
}
