import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {

  register() {
    return { res: 'register' }
  }

  login() {
    return { res: 'login' }
  }
}
