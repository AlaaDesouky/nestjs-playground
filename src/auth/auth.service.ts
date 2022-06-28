import { ForbiddenException, Injectable } from '@nestjs/common';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import * as argon from 'argon2'
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) { }

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
            return this.generateJwtSignToken(user.id, user.email).pipe(
              map(jwt => {
                return { access_token: jwt }
              })
            )
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

  login(dto: AuthDto) {
    return from(this.prisma.user.findUnique({ where: { email: dto.email } })).pipe(
      switchMap((user: User) => this.comparePassword(user.password, dto.password).pipe(
        map((match: boolean) => {
          if (match) {
            return this.generateJwtSignToken(user.id, user.email).pipe(
              map(jwt => {
                return { access_token: jwt }
              })
            )
          } else {
            throw Error
          }
        })
      )),
      catchError(error => {
        throw new ForbiddenException('Credentials Error: incorrect email/password')
      })
    )
  }

  hashPassword(password: string): Observable<string> {
    return from(argon.hash(password))
  }

  comparePassword(passwordHash: string, password: string): Observable<boolean> {
    return from(argon.verify(passwordHash, password))
  }

  generateJwtSignToken(userId: number, email: string): Observable<string> {
    return from(this.jwt.signAsync(
      { sub: userId, email },
      { expiresIn: '15m', secret: this.config.get('JWT_SECRET') }))
  }
}
