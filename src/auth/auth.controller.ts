// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.services';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokensDto } from './dto/tokens.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }
   // Endpoint para refrescar los tokens usando refresh token
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }): Promise<TokensDto> {

    return this.authService.refreshTokens(body.refreshToken);
  }

  // Logout → borra refresh token del usuario
  @Post('logout') 
  @UseGuards(JwtAuthGuard)
async logout(@Req() req) {
  const user = req.user; // Asegúrate que esto contiene el usuario
  console.log(user.id);
  if (!user?.id) {
    throw new UnauthorizedException('Usuario no autenticado');
  }
  
  await this.authService.logout(user.id); // Esto debería ser el ID del usuario
  return { message: 'Logout exitoso' };
}
  // Devuelve el usuario autenticado
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    return req.user;
  }

}
