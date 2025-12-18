# Localization Files

This directory contains translation files for the game.

## Supported Languages

- `sv.json` - Swedish (Svenska)
- `en.json` - English

## Adding a New Language

To add support for a new language:

1. **Create a new JSON file** named with the ISO 639-1 language code (e.g., `no.json` for Norwegian, `da.json` for Danish)

2. **Copy the structure** from `en.json` or `sv.json` and translate all values:
   ```json
   {
     "ui": { ... },
     "math": { ... },
     "game": { ... }
   }
   ```

3. **Update `index.ts`** to import and export the new locale:
   ```typescript
   import no from './no.json';
   
   export const locales = {
     sv,
     en,
     no  // Add new locale
   };
   ```

4. **Test** by changing the language in the game UI

## Translation Structure

- **ui**: User interface text (buttons, labels, validation messages)
- **math**: Mathematical operation names
- **game**: Game-specific text (title, welcome message)

## Future Language Considerations

When adding languages with special requirements:

- **Norwegian**: Consider Bokmål (`nb`) and Nynorsk (`nn`) variants
- **RTL Languages** (Arabic, Hebrew): May require additional CSS changes
- **Fallback**: English (`en`) is used as fallback for missing translations
