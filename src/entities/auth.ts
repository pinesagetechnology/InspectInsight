export interface AuthRequest {
    email: string;
    password: string;
    remoteIpAddress: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
}
