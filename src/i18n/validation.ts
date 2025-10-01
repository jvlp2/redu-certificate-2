import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';

export type validationKeys = keyof I18nTranslations['validation'];

export const validationMessage = (key: validationKeys, args?: object) =>
  i18nValidationMessage<I18nTranslations>(`validation.${key}`, args);
