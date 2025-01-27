const storageKeysHelper = <T extends Record<string, string>>(keys: T) => keys

// Składania pozwalająca dodać odpowiedni typ do obiektu STORAGEKEYS, tak aby użycie klucza nie będącego w obiekcie wywołało błąd.

export const STORAGEKEYS = storageKeysHelper({
   ACCESS_TOKEN: 'ACCESS_TOKEN',
   USER_DATA: 'USER_DATA',
} as const)