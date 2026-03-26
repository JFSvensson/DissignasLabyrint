/* eslint-disable @typescript-eslint/no-var-requires */
const sv = require('../src/locales/sv.json');
const en = require('../src/locales/en.json');
const no = require('../src/locales/no.json');
const fi = require('../src/locales/fi.json');
const da = require('../src/locales/da.json');

function flattenKeys(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...flattenKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe('Locale files', () => {
  const referenceKeys = flattenKeys(sv);
  const localeEntries: [string, Record<string, any>][] = [
    ['en', en],
    ['no', no],
    ['fi', fi],
    ['da', da],
  ];

  test('reference (sv) should have translation keys', () => {
    expect(referenceKeys.length).toBeGreaterThan(0);
  });

  test.each(localeEntries)('%s should have all keys from sv', (locale, translations) => {
    const keys = flattenKeys(translations);
    expect(keys).toEqual(referenceKeys);
  });

  test.each(localeEntries)('%s should have no empty string values', (locale, translations) => {
    const checkEmpty = (obj: Record<string, any>, path = ''): string[] => {
      const empty: string[] = [];
      for (const key of Object.keys(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof obj[key] === 'object') {
          empty.push(...checkEmpty(obj[key], fullPath));
        } else if (obj[key] === '') {
          empty.push(fullPath);
        }
      }
      return empty;
    };
    expect(checkEmpty(translations)).toEqual([]);
  });

  test.each(localeEntries)('%s should have only string leaf values', (locale, translations) => {
    const checkTypes = (obj: Record<string, any>, path = ''): string[] => {
      const bad: string[] = [];
      for (const key of Object.keys(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          bad.push(...checkTypes(obj[key], fullPath));
        } else if (typeof obj[key] !== 'string') {
          bad.push(fullPath);
        }
      }
      return bad;
    };
    expect(checkTypes(translations)).toEqual([]);
  });
});
