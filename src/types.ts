export type Screen = "home" | "checkout" | "tracking" | "history";
export type OrderStatus = 0 | 1 | 2;
export type OptionType = "spicy" | "sweet";

export interface Store {
  id: string;
  name: string;
  lock: string;
  rating: number;
  cookTime: string;
  queue: number;
  location: string;
  emoji: string;
}

export interface MenuItem {
  id: string;
  storeId: string;
  name: string;
  price: number;
  desc: string;
  emoji: string;
  tag?: string;
  optionsType?: OptionType;
}

export interface CartItem {
  cartId: string;
  itemId: string;
  qty: number;
  option: string;
  note: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  storeName: string;
  option?: string;
  note?: string;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  slot: string;
  createdAt: number;
}

export interface PastOrder {
  id: string;
  date: string;
  items: string;
  total: number;
  rating: number;
}