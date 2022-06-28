import { ForbiddenException, Injectable } from '@nestjs/common';
import { catchError, from, map, Observable, switchMap } from 'rxjs';
import * as argon from 'argon2'
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }

  register(dto: AuthDto) {
    return this.hashPassword(dto.password).pipe(
      switchMap((passwordHash: string) => {
        return from(this.prisma.user.create({
          data: {
            email: dto.email,
            password: passwordHash
          }
        })).pipe(
          map((user: User) => {
            delete user.password
            return user
          }),
          catchError(error => {
            if (error instanceof PrismaClientKnownRequestError) {
              if (error.code === 'P2002') {
                throw new ForbiddenException('Credentials Error: email already exists')
              }
            }
            throw error
          })
        )
      })
    )
  }

  login() {
    return { res: 'login' }
  }

  hashPassword(password: string): Observable<string> {
    return from(argon.hash(password))
  }
}
