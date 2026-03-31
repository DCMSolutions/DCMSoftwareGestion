import {getRequestConfig} from 'next-intl/server';
import { cookies } from 'next/headers';
import { DefaultLanguage, type Languages, LanguagesEnum, Messages } from '~/translations';

export default getRequestConfig(async ({ locale }) => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const ck = cookies();
  let lang: Languages | undefined = (ck.get("lang")?.value ?? locale) as Languages | undefined;
  if (!lang || !LanguagesEnum.find(v => v === lang)) {
    lang = DefaultLanguage;
  }

  return {
    locale: lang,
    messages: Messages[lang],
  };
});