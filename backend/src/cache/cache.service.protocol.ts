export abstract class CacheServiceProtocol {
  abstract get(key: string, ...args: any[]): Promise<string | null>;
  abstract setNx(key: string, value: string | Buffer | number, ...args: any[]): Promise<boolean>;
  abstract remove(key: string): Promise<void>;
  abstract exists(key: string | Buffer): Promise<number>;
}
