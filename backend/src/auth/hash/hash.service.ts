import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcryptjs';
import { HashServiceProtocol } from './hash.service.protocol';

@Injectable()
export class HashService implements HashServiceProtocol {
  async hash(plain: string): Promise<string> {
    return hash(plain, 12);
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
  }
}
