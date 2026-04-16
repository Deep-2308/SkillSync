import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "skillsync-dev-secret-change-in-production"
)

export interface TokenPayload {
  id: string
  email: string
  role: string
  name: string
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}
