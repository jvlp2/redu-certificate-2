import {
  BadRequestException,
  FileTypeValidatorOptions,
  FileValidator,
  MaxFileSizeValidatorOptions,
  ParseFilePipe,
} from '@nestjs/common';
import { FileTypeValidator } from './file-type.validator';
import { MaxFileSizeValidator } from './max-file-size.validator';

export type FileValidationOptions = MaxFileSizeValidatorOptions &
  FileTypeValidatorOptions & {
    fileIsRequired?: boolean;
  };

export class FileValidationFactory {
  static createValidationPipe(options: FileValidationOptions): ParseFilePipe {
    const { maxSize, fileType, fileIsRequired } = options;
    const validators: FileValidator[] = [];

    if (maxSize) {
      validators.push(new MaxFileSizeValidator(options));
    }

    if (fileType) {
      validators.push(new FileTypeValidator(options));
    }

    return new ParseFilePipe({ fileIsRequired, validators });
  }

  static convertToBytes(size: number, unit: 'kb' | 'mb' | 'gb' = 'mb'): number {
    switch (unit) {
      case 'kb':
        return size * 1024;
      case 'mb':
        return size * 1024 * 1024;
      case 'gb':
        return size * 1024 * 1024 * 1024;
      default:
        throw new BadRequestException('Invalid file size unit');
    }
  }
}
