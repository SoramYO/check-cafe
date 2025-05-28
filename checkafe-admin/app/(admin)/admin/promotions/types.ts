export interface Discount {
    _id: string
    title: string
    description: string
    points_required: number
    discount_value: number
    discount_type: string
    code: string
    shop_id: string
    is_vip_only: boolean
    usage_limit: number
    used_count: number
    start_date: string
    end_date: string
    is_active: boolean
    createdAt: string
}

export interface DiscountForm {
    title: string
    description: string
    points_required: number
    discount_value: number
    discount_type: string
    code: string
    shop_id: string
    is_vip_only: boolean
    usage_limit: number
    used_count: number
    start_date: string
    end_date: string
    is_active: boolean
  }
