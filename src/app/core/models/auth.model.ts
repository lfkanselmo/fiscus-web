export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}
