import {
    Controller,
    Get,
    Patch,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Param,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from 'src/utils/decorators/get-user.decorator';
import { FindUserActivitiesDto } from './dto/find-user-activities.dto';
import ActivityResponse from './dto/activity-response.dto';
import { AuthCheckInterceptor } from 'src/common/interceptors/auth-check.interceptor';
import { NullableType } from 'src/utils/types/nullable.type';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    // 로그인 여부로
    @Get('/profile')
    @UseInterceptors(AuthCheckInterceptor)
    @HttpCode(HttpStatus.OK)
    getUserProfile(@GetUser() user: User): NullableType<User> {
        return user;
    }

    // 사용자의 공개 프로필
    @Get('/public/profile/:userId')
    @HttpCode(HttpStatus.OK)
    async getUserPublicProfile(@Param('userId') userId: string) {
        return this.usersService.findUserPublicProfileByUserId(userId);
    }

    @Patch('/profile')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async updateUserProfile(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.usersService.update(user.id, updateUserDto);
    }

    @Get('/activities/:userId')
    @HttpCode(HttpStatus.OK)
    async getUserActivities(
        @Param('userId') userId: string,
        @Query() findUserActivitiesDto: FindUserActivitiesDto,
    ): Promise<ActivityResponse> {
        return this.usersService.findUserActivities(findUserActivitiesDto, userId);
    }
}
