import { JWT } from "next-auth/jwt";
import "next/server";

declare module "next/server" {
    interface NextRequest {
        nextauth: {
            token: JWT | null;
        };
    }
}
