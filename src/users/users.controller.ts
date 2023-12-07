import { Controller, Get, Patch, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) {}

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

    /**
     * Update the user's profile.
     *
     * @param user - The authenticated user.
     * @param updateUserDto - Data for updating the user's profile.
     */
    @Patch('/profile')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateUserProfile(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(user.id, updateUserDto);
    }
}
