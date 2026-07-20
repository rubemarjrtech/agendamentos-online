export abstract class TokenServiceProtocol {
  abstract generateAsync<T extends object>(payload: T, ...args: any[]): Promise<string>;
  abstract verifyAsync<R extends object>(token: string, ...args: any[]): Promise<R>;
}
