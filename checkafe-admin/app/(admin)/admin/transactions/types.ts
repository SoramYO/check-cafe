export interface Package {
    _id: string
    name: string
    description: string
    price: number
    duration: number
    icon?: string
    createdAt?: string
    updatedAt?: string
}

export interface User {
    _id: string
    full_name: string
    email: string
    phone?: string
    avatar?: string
}

export interface Payment {
    _id: string
    amount: number
    method: string
    status: string
    createdAt: string
}

export interface UserPackage {
    _id: string
    user_id: User
    package_id: Package
    payment_id?: Payment
    createdAt: string
}