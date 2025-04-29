export interface TokenPayload {
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
    jti: string;
    exp: number;
    iss: string;
    aud: string;
}

export interface AuthData {
    token: string | null;
    refreshToken: string | null;
    userId: string | null;
    email: string | null;
}
