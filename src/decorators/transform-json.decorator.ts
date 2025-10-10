import { plainToInstance, Transform } from 'class-transformer';

export function TransformJson<T>(dto: new () => T) {
  return Transform(({ value }): unknown => {
    if (typeof value !== 'string') return value;

    try {
      const parsed = JSON.parse(value) as T;
      return plainToInstance(dto, parsed);
    } catch {
      return value;
    }
  });
}
