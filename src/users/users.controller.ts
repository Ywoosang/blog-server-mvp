import { Controller, Get, Patch, Body, UseGuards, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from 'src/utils/decorators/get-user.decorator';
import { plainToClass } from 'class-transformer';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

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
        delete user.password;

        return user;
    }

    @Get('/public/profile/:userLoginId')
    @HttpCode(HttpStatus.OK)
    async getUserPublicProfile(@Param('userLoginId') userLoginId: string) {
        return this.userService.findUserPublicProfileByLoginId(userLoginId);
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
    async updateUserProfile(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto): Promise<UserProfileDto> {
        const updatedUser = this.userService.update(user.id, updateUserDto);
        return plainToClass(UserProfileDto, updatedUser);
    }
}
