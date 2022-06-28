import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { catchError, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('/register')
  register(@Body() dto: AuthDto): Observable<User | Object> {
    return this.authService.register(dto).pipe(
      map((user: User) => user),
      catchError(error => of({ error: error.message }))
    )
  }

  @Post('/login')
  login(@Body() dto: AuthDto) {
    return this.authService.login()
  }
}
