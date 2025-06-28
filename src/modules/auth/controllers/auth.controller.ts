import { AuthService } from '@modules/auth/services/auth.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
  Post,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { Public } from '@modules/auth/decorators/public.decorator';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { RequestUser } from '@modules/auth/interfaces/request-user.interface';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { TokenResponseDto } from '@modules/auth/dto/token-response.dto';
import { UserResponseDto } from '@modules/auth/dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<TokenResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ): Promise<TokenResponseDto> {
    return this.authService.login(loginDto, userAgent, ip);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    await this.authService.logout(refreshToken);
    return { message: 'Logout successful' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<TokenResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refreshToken(refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: RequestUser): Promise<UserResponseDto> {
    return this.authService.getProfile(user.id);
  }
}
