export default class User {
    mid: number;
    uname: string | undefined;
    isLogin: boolean | undefined;

    constructor(mid: number, uname?: string, isLogin?: boolean) {
        this.mid = mid;
        this.uname = uname;
        this.isLogin = isLogin;
    }
}