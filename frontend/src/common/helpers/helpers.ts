/**
 * Funkcja pomocnicza która opóźnia wykonanie danego kawałka kodu o określoną parametrem liczę minisekund. 
 * Realizuje ona mechanizm "czekania" na wykonanie dalszego kawałka kodu
 * 
 * @param time - czas w milisekundach na jaki wykonanie funkcji ma zostać opóźnione
 * @returns 
 */
export const sleep = (time: number) => new Promise(r => setTimeout(r, time));