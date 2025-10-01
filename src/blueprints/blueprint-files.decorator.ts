import { BadRequestException } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '../interceptors/file-fields.interceptor';

type FileType = 'html' | 'image';

const BLUEPRINT_FILE_FIELDS = [
  { name: 'front', maxCount: 1, type: 'html' },
  { name: 'backSmall', maxCount: 1, type: 'html' },
  { name: 'backLarge', maxCount: 1, type: 'html' },
  { name: 'frontBackground', maxCount: 1, type: 'image' },
  { name: 'backBackground', maxCount: 1, type: 'image' },
];
const FIELD_TYPE_MAP = BLUEPRINT_FILE_FIELDS.reduce((acc, field) => {
  acc[field.name] = field.type as FileType;
  return acc;
}, {});

const MIME_TYPE_VALIDATORS: Record<FileType, (mimetype: string) => boolean> = {
  html: (mimetype) => mimetype === 'text/html',
  image: (mimetype) => mimetype.startsWith('image/'),
};

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const expectedType = FIELD_TYPE_MAP[file.fieldname] as FileType | undefined;
  if (!expectedType || !MIME_TYPE_VALIDATORS[expectedType](file.mimetype)) {
    return callback(
      new BadRequestException(`${file.fieldname} must be a ${expectedType}`),
      false,
    );
  }

  return callback(null, true);
};

export function BlueprintFilesDecorator() {
  return UseInterceptors(
    FileFieldsInterceptor(BLUEPRINT_FILE_FIELDS, {
      fileFilter,
    }),
  );
}
