import { IFile } from '@nestjs/common/pipes/file/interfaces';
import { MaxFileSizeValidator as DefaultMaxFileSizeValidator } from '@nestjs/common';

export class MaxFileSizeValidator extends DefaultMaxFileSizeValidator {
  isValid(value: unknown): boolean {
    if (!value) return false;

    if (typeof value === 'object' && !('buffer' in value)) {
      return Object.values(value).every((file) => this.isValid(file));
    }

    if (Array.isArray(value)) {
      return value.every((file) => super.isValid(file as IFile));
    }

    return super.isValid(value as IFile);
  }
}
