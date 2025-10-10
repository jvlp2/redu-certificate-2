import { ParseFilePipe } from '@nestjs/common';
import { FileTypeValidator } from './file-type.validator';
import { MaxFileSizeValidator } from './max-file-size.validator';

export type FileValidationType = 'image' | 'html';
export interface FileValidationOptions {
  type: FileValidationType;
  maxSize?: number;
  required?: boolean;
  skipMagicNumbersValidation?: boolean;
}

const DEFAULT_SIZES: Readonly<Record<FileValidationType, number>> = {
  image: 1000000, // 1MB
  html: 10000, // 10KB
};

const MIME_TYPES: Readonly<Record<FileValidationType, string>> = {
  image: 'image/*',
  html: 'text/html',
};

export class FileValidationFactory {
  static createValidationPipe(options: FileValidationOptions): ParseFilePipe {
    const {
      type,
      maxSize = DEFAULT_SIZES[type],
      required = false,
      skipMagicNumbersValidation = true,
    } = options;

    const validators = [
      new MaxFileSizeValidator({ maxSize }),
      new FileTypeValidator({
        fileType: MIME_TYPES[type],
        skipMagicNumbersValidation,
      }),
    ];

    return new ParseFilePipe({
      fileIsRequired: required,
      validators,
    });
  }

  static createImageValidationPipe(
    options: Partial<FileValidationOptions> = {},
  ): ParseFilePipe {
    return this.createValidationPipe({
      type: 'image',
      ...options,
    });
  }

  static createHtmlValidationPipe(
    options: Partial<FileValidationOptions> = {},
  ): ParseFilePipe {
    return this.createValidationPipe({
      type: 'html',
      ...options,
    });
  }
}
