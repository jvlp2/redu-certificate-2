import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

type FilesMap = Record<string, Express.Multer.File | Express.Multer.File[]>;
type MulterFilesCompat =
  | FilesMap
  | Express.Multer.File[]
  | { [fieldname: string]: Express.Multer.File[] };

export function Base64FileInterceptor<T>(_dto: new () => T) {
  @Injectable()
  class Base64FileInterceptorClass implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const http = context.switchToHttp();
      const request = http.getRequest<
        Request & { files?: MulterFilesCompat }
      >();

      const body: unknown = request.body as unknown;
      if (body && typeof body === 'object') {
        const filesMap: FilesMap =
          (request.files as FilesMap | undefined) ?? {};

        const pushFile = (fieldPath: string, file: Express.Multer.File) => {
          const existing = filesMap[fieldPath];
          if (!existing) {
            filesMap[fieldPath] = file;
            return;
          }
          if (Array.isArray(existing)) {
            existing.push(file);
          } else {
            filesMap[fieldPath] = [existing, file];
          }
        };

        const isLikelyBase64 = (value: string): boolean => {
          if (typeof value !== 'string' || value.length === 0) return false;
          // data URL form
          if (value.startsWith('data:') && value.includes(';base64,')) {
            const idx = value.indexOf(';base64,');
            const data = value.slice(idx + ';base64,'.length);
            return isBase64Core(data);
          }
          return isBase64Core(value);
        };

        const isBase64Core = (s: string): boolean => {
          // Remove whitespace
          const normalized = s.replace(/\s+/g, '');
          // Base64 should be divisible by 4
          if (normalized.length % 4 !== 0) return false;
          // Valid base64 chars
          if (!/^[-A-Za-z0-9+/_=]*$/.test(normalized)) return false;
          try {
            const buf = Buffer.from(normalized, 'base64');
            // If decoding results in zero length for non-empty input, treat as invalid
            return normalized.length === 0 ? false : buf.length > 0;
          } catch {
            return false;
          }
        };

        const toMulterFile = (
          fieldname: string,
          base64: string,
        ): Express.Multer.File => {
          let mime = 'application/octet-stream';
          let filename = 'filename';
          let data = base64;
          if (base64.startsWith('data:') && base64.includes(';base64,')) {
            const header = base64.substring(5, base64.indexOf(';base64,')); // after 'data:' until ';base64,'
            if (header) mime = header;
            data = base64.substring(
              base64.indexOf(';base64,') + ';base64,'.length,
            );
            const ext = mime.split('/')[1] || 'bin';
            filename = `upload.${ext}`;
          }
          const buffer = Buffer.from(data.replace(/\s+/g, ''), 'base64');
          const file: Express.Multer.File = {
            fieldname,
            originalname: filename,
            encoding: '7bit',
            mimetype: mime,
            buffer,
            size: buffer.length,
          } as unknown as Express.Multer.File; // cast for fields we don't use
          return file;
        };

        const walk = (node: unknown, path: string) => {
          if (node == null) return;
          if (typeof node === 'string') {
            if (isLikelyBase64(node)) {
              const file = toMulterFile(path, node);
              pushFile(path, file);
            }
            return;
          }
          if (Array.isArray(node)) {
            for (let i = 0; i < node.length; i++) {
              walk(node[i], `${path}`);
            }
            return;
          }
          if (typeof node === 'object') {
            for (const key of Object.keys(node as Record<string, unknown>)) {
              const child = (node as Record<string, unknown>)[key];
              if (key === 'file') {
                const childPath = path ? `${path}` : key;
                walk(child, childPath);
              } else {
                const childPath = path ? `${path}.${key}` : key;
                walk(child, childPath);
              }
            }
          }
        };

        walk(body, '');
        // console.log(filesMap);
        if (Object.keys(filesMap).length > 0) {
          const reqWithFiles = request as unknown as {
            files?: MulterFilesCompat;
          };
          reqWithFiles.files = filesMap;
        }
      }

      return next.handle();
    }
  }

  return Base64FileInterceptorClass;
}
