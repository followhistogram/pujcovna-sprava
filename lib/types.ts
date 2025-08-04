export type PriceTier = {
  id?: string
  min_days: number
  price_per_day: number
}

export type SerialNumber = {
  id?: string
  serial_number: string
  status: "active" | "serviced" | "retired"
}

export type PackageItem = {
  id?: string
  name: string
}

export type Category = {
  id: string
  name: string
}

export type Film = {
  id: string
  name: string
  type: "Polaroid" | "Instax Mini" | "Instax Square" | "Instax Wide"
  stock: number
  low_stock_threshold: number
  description: string | null
  shots_per_pack: number | null
  price: number | null
  purchase_price: number | null
  images: string[] | null
}

export type Camera = {
  id: string
  created_at: string
  name: string
  category_id: string | null
  status: "active" | "draft"
  stock: number
  deposit: number
  description: string | null
  short_description: string | null
  images: string[] | null
  package_contents: PackageItem[] | string | null
  pricing_tiers: PriceTier[]
  serial_numbers: SerialNumber[]
  compatible_films?: Film[]
  categories?: Category
}

export type CameraWithCategory = Camera & {
  categories: { name: string } | null
}

export type Accessory = {
  id: string
  name: string
  description: string | null
  stock: number
  price: number | null
  purchase_price: number | null
  images: string[] | null
}

export type InventoryItem = Film | Accessory

export type ReservationStatus =
  | "new"
  | "confirmed"
  | "ready_for_dispatch"
  | "active"
  | "returned"
  | "completed"
  | "canceled"

export type Reservation = {
  id: string
  short_id: string
  created_at: string
  updated_at: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  customer_address: {
    street: string
    city: string
    zip: string
  } | null
  rental_start_date: string
  rental_end_date: string
  status: ReservationStatus
  subtotal: number
  deposit_total: number
  total_price: number
  amount_paid: number
  delivery_method: "pickup" | "delivery" | null
  payment_method: string | null // např. 'card', 'cash', 'bank_transfer'
  customer_notes: string | null
  internal_notes: string | null
  invoice_id: number | null
  invoice_number: string | null
  invoice_url: string | null
  shipment_id: number | null
  shipment_tracking_number: string | null
  shipment_label_url: string | null
  shipping_outbound_url: string | null
  shipping_return_url: string | null
}

export type ReservationItem = {
  id: string
  reservation_id: string
  item_id: string
  item_type: "camera" | "film" | "accessory"
  name: string
  quantity: number
  unit_price: number
  deposit: number
}
