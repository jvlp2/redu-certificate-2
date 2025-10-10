import { IFile } from '@nestjs/common/pipes/file/interfaces';
import { FileTypeValidator as DefaultFileTypeValidator } from '@nestjs/common';

export class FileTypeValidator extends DefaultFileTypeValidator {
  async isValid(value: unknown): Promise<boolean> {
    if (!value) return true;

    if (typeof value === 'object' && !('buffer' in value)) {
      return (
        await Promise.all(
          Object.values(value).map(async (file) => await this.isValid(file)),
        )
      ).every((isValid) => isValid);
    }

    if (Array.isArray(value)) {
      return (
        await Promise.all(
          value.map(async (file) => await super.isValid(file as IFile)),
        )
      ).every((isValid) => isValid);
    }

    // console.log('value', value);
    // console.log('this.validationOptions', this.validationOptions);
    // console.log(
    //   'super.isValid(value as IFile)',
    //   await super.isValid(value as IFile),
    // );

    return super.isValid(value as IFile);
  }
}
