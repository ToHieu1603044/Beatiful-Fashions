export interface IUsers {
    id: string;
    name: string;
    email: string;
    emailVerifiedAt: string;
    phone: number;
    address: string;
    city: string;
    district: string;
    ward: string;
    zipCode: number;
    role: "member" | "admin";
  }
  