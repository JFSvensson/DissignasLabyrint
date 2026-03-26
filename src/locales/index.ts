import sv from './sv.json';
import en from './en.json';
import no from './no.json';
import fi from './fi.json';
import da from './da.json';

export const locales = {
  sv,
  en,
  no,
  fi,
  da
};

export type SupportedLocale = keyof typeof locales;

export const supportedLocales: SupportedLocale[] = ['sv', 'en', 'no', 'fi', 'da'];

export const defaultLocale: SupportedLocale = 'sv';
