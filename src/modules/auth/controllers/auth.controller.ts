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
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { Public } from '@modules/auth/decorators/public.decorator';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { RequestUser } from '@modules/auth/interfaces/request-user.interface';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { TokenResponseDto } from '@modules/auth/dto/token-response.dto';
import { UserResponseDto } from '@modules/auth/dto/user-response.dto';
import { AuthService } from '@modules/auth/services/auth.service';
import { AppConfig } from '@config/app.config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res() reply: FastifyReply,
  ): Promise<TokenResponseDto> {
    const result = await this.authService.register(registerDto);

    this.setAuthCookies(reply, result.accessToken, result.refreshToken);

    return result;
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
    @Res() reply: FastifyReply,
  ): Promise<TokenResponseDto> {
    const response = await this.authService.login(loginDto, userAgent, ip);

    this.setAuthCookies(reply, response.accessToken, response.refreshToken);

    return response;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(
    @Body('refreshToken') refreshToken: string,
    @Res() reply: FastifyReply,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    await this.authService.logout(refreshToken);

    this.clearAuthCookies(reply);

    return { message: 'Logout successful' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<TokenResponseDto> {
    const token = request.cookies.refreshToken;

    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const result = await this.authService.refreshToken(token);

    // Actualizar cookies
    this.setAuthCookies(reply, result.accessToken, result.refreshToken);

    return result;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: RequestUser): Promise<UserResponseDto> {
    return this.authService.getProfile(user.id);
  }

  private setAuthCookies(
    reply: FastifyReply,
    accessToken: string,
    refreshToken: string,
  ): void {
    // Configuración de cookies seguras
    const appConfig = this.configService.get('app') as AppConfig;
    const domain = appConfig.host;
    const secure = appConfig.nodeEnv === 'production';

    // Cookie para el access token (corta duración)
    reply.setCookie('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutos en milisegundos
      domain,
    });

    // Cookie para el refresh token (larga duración)
    reply.setCookie('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
      domain,
    });
  }

  private clearAuthCookies(reply: FastifyReply): void {
    const appConfig = this.configService.get('app') as AppConfig;
    const domain = appConfig.host;

    reply.clearCookie('accessToken', {
      path: '/',
      domain,
    });

    reply.clearCookie('refreshToken', {
      path: '/',
      domain,
    });
  }
}
