import { Controller, Get, Patch, Body, UseGuards, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from 'src/utils/decorators/get-user.decorator';
import { plainToClass } from 'class-transformer';
import { FindUserActivitiesDto } from './dto/find-user-activities.dto';
import ActivityResponse from './dto/activity-response.dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    /**
     * Get the user's profile.
     *
     * @param user - The authenticated user.
     * @returns The user's profile data with the password field removed.
     */
    @Get('/profile')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    getUserProfile(@GetUser() user: User) {
        return user;
    }

    @Get('/public/profile/:userId')
    @HttpCode(HttpStatus.OK)
    async getUserPublicProfile(@Param('userId') userId: string) {
        return this.usersService.findUserPublicProfileByLoginId(userId);
    }

    /**
     * Update the user's profile.
     *
     * @param user - The authenticated user.
     * @param updateUserDto - Data for updating the user's profile.
     */
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
        @Query() findUserActivitiesDto: FindUserActivitiesDto
    ): Promise<ActivityResponse> {
        return this.usersService.findUserActivities(findUserActivitiesDto, userId);
    }
}
