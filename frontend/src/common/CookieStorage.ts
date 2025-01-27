import Cookies from "universal-cookie";

export class SessionStorage{
    public add(key: string, value: string){
        sessionStorage.setItem(key,value);
    }

    public get(key : string) : string | null {
        return sessionStorage.getItem(key) as string ;
    }

    public addCookie(key : string, value : string){
        const cookie = new Cookies();
        cookie.set(key, value, {secure: true})
    }

    public changeItemValue(key: string, newValue: string){
        sessionStorage.setItem(key, newValue);
    }

    public clearSessionStorage(){
        sessionStorage.clear();
    }
}