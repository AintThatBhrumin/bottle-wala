export const APP_NAME = 'Bottle Wala';
export const APP_DESCRIPTION = 'Find trusted water suppliers near you';

export const API_ENDPOINTS = {
  auth: '/api/auth',
  products: '/api/products',
  suppliers: '/api/suppliers',
  orders: '/api/orders',
  revenue: '/api/revenue',
} as const;

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  explore: '/explore',
  supplier: '/supplier',
  supplierDetail: '/supplier/[id]',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  orderDetail: '/orders/[id]',
  supplierDashboard: '/supplier-dashboard',
  revenueDashboard: '/revenue',
} as const;

export const USER_ROLES = {
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier',
  ADMIN: 'admin',
} as const;

export const GUEST_SESSION_EXPIRY_DAYS = 14;

export const PAGINATION = {
  pageSize: 20,
  perPage: 20,
} as const;
