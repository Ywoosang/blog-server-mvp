import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { AuthGoogleService } from "./auth-google.service";
import { AuthGoogleLoginDto } from "./dto/auth-google-login.dto";
import { type LoginResponseType } from "../auth/types/login-response.type";

@Controller("auth/google")
export class AuthGoogleController {
  constructor(
    private readonly authService: AuthService,
    private readonly authGoogleService: AuthGoogleService
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: AuthGoogleLoginDto
  ): Promise<LoginResponseType> {
    const socialData = await this.authGoogleService.getProfileByToken(loginDto);

    return await this.authService.validateSocialLogin("google", socialData);
  }
}
