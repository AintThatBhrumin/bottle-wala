export type UserRole = "customer" | "supplier" | "admin";

export type User = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  date_joined: string;
};

export type AuthResponse = {
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  name: string;
  role: Exclude<UserRole, "admin">;
  password: string;
};
