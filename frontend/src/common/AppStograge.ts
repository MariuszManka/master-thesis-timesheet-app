import { jwtDecode } from "jwt-decode";
import AES from 'crypto-js/aes'
import UTF8 from 'crypto-js/enc-utf8';
import { STORAGEKEYS } from 'environment/Keys'
 

export interface TokenModel {
   nbf: number;
   exp: number;
   iss: string;
   client_id: string;
   sub: string;
   auth_time: number;
   idp: string;
   userKey: string;
   jti: string;
   iat: number;
   scope: string[];
   amr: string[];
}

export class AppStorage{
   private getKey() : string{
      const token = sessionStorage.getItem(STORAGEKEYS.ACCESS_TOKEN)
      const decoded = jwtDecode(token as string) as TokenModel
      return decoded.sub
   }

   public userHasSession() : boolean{
      const token = sessionStorage.getItem(STORAGEKEYS.ACCESS_TOKEN)
      return token !== null
   }

   private encrypt(data: string) {
      this.getKey()
      const encryptedData = AES.encrypt(JSON.stringify({data}), this.getKey()).toString()
      return encryptedData
   }

   private decrypt(data : string) {
      this.getKey()
      const decryptedData = AES.decrypt(data, this.getKey())
      const result = decryptedData.toString(UTF8)
      const resultToReturn = JSON.parse(result)
      return resultToReturn.data
   }

   public getItem(key: string): string {
      return this.decrypt(localStorage.getItem(key) as string);
   }

   public isKeyExists(key: string) : boolean{
      const item = localStorage.getItem(key);
      return item !== null ? true : false;
   }

   public setItem(key: string, string : string): void{
      return localStorage.setItem(key, this.encrypt(string));
   }

   clearLocalStorage (){
      localStorage.clear();
   }
}