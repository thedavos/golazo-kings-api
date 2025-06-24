import { AuthService } from '@modules/auth/services/auth.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { AuthResponseDto } from '@modules/auth/dto/auth-response.dto';
import { Public } from '@modules/auth/decorators/public.decorator';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { RequestUser } from '@modules/auth/interfaces/request-user.interface';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: RequestUser) {
    return this.authService.getProfile(user.id);
  }
}
