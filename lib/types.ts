export interface Camera {
  id: string
  name: string
  brand: string
  model: string
  description?: string
  daily_rate: number
  deposit: number
  image_url?: string
  is_available: boolean
  created_at: string
  updated_at: string
  compatible_films?: string[]
}

export interface Film {
  id: string
  name: string
  brand: string
  type: string
  format: string
  exposures: number
  price: number
  stock_quantity: number
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Accessory {
  id: string
  name: string
  description?: string
  price: number
  stock_quantity: number
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  short_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  rental_start_date: string
  rental_end_date: string
  status: "new" | "confirmed" | "ready_for_dispatch" | "active" | "returned" | "completed" | "canceled"
  total_amount: number
  deposit_total: number
  notes?: string
  created_at: string
  updated_at: string
  delivery_method: "pickup" | "shipping"
  delivery_address?: string
  shipping_cost?: number
  invoice_url?: string
  shipping_tracking_number?: string
  shipping_tracking_url?: string
  items?: ReservationItem[]
}

export interface ReservationItem {
  id: string
  reservation_id: string
  item_id: string
  item_type: "camera" | "film" | "accessory"
  name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface PaymentTransaction {
  id: string
  reservation_id: string
  amount: number
  type: "payment" | "refund"
  method: "cash" | "card" | "bank_transfer" | "other"
  description?: string
  created_at: string
}

export interface InventoryLog {
  id: string
  item_id: string
  item_type: "film" | "accessory"
  change_type: "adjustment" | "sale" | "return" | "damage" | "loss"
  quantity_change: number
  old_quantity: number
  new_quantity: number
  reason?: string
  created_at: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[]
  created_at: string
  updated_at: string
}

export interface EmailLog {
  id: string
  reservation_id?: string
  recipient_email: string
  subject: string
  content: string
  status: "sent" | "failed"
  error_message?: string
  sent_at: string
}

export interface SMTPSettings {
  id: string
  host: string
  port: number
  username: string
  password: string
  from_email: string
  from_name: string
  use_tls: boolean
  created_at: string
  updated_at: string
}
