export interface User {
    id?: number 
    email:string;
    password: string;
    name:string;
    age:number;
    confirmPassword:string;
}
export interface IUsers {
    id: string;
    name: string;
    email: string;
    password: string;
    emailVerifiedAt: string;
    phone: number;
    address: string;
    city: string;
    district: string;
    ward: string;
    zipCode: number;
    password_confirmation:string;
    active: boolean;
    role: "member | admin";
    createDate: string;
  }
  