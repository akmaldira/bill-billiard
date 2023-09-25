// disable prettier for this file
import "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
  }

  interface Session {
    user: User & {
      role: string;
    };
    token: {
      role: string;
    };
  }
}
