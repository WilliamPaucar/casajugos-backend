export interface JwtPayload {
  sub: number; // ID del usuario
  email: string;
  rol: string;
  nombre:string;
}
