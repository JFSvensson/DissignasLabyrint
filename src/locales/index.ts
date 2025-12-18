import sv from './sv.json';
import en from './en.json';

export const locales = {
  sv,
  en
};

export type SupportedLocale = keyof typeof locales;

export const supportedLocales: SupportedLocale[] = ['sv', 'en'];

export const defaultLocale: SupportedLocale = 'sv';
