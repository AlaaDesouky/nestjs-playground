import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('/register')
  register(@Body() dto: AuthDto): Observable<Object> {
    return this.authService.register(dto).pipe(
      switchMap((jwt) => jwt),
      catchError(error => of({ error: error.message }))
    )
  }

  @Post('/login')
  login(@Body() dto: AuthDto): Observable<User | Object> {
    return this.authService.login(dto).pipe(
      switchMap((jwt) => jwt),
      catchError(error => of({ error: error.message }))
    )
  }
}
