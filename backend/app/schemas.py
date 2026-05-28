from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "student"
    outlet_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class UserOutletAssign(BaseModel):
    outlet_id: Optional[int] = None

# Menu Item schemas
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str
    is_veg: bool = True
    is_available: bool = True

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemResponse(MenuItemBase):
    id: int
    outlet_id: int

    class Config:
        from_attributes = True

# Outlet schemas
class OutletBase(BaseModel):
    name: str
    location: str
    image_url: Optional[str] = None
    is_open: bool = True

class OutletCreate(OutletBase):
    pass

class OutletResponse(OutletBase):
    id: int
    items: List[MenuItemResponse] = []

    class Config:
        from_attributes = True

# Order Item schemas
class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    price_at_order: float
    menu_item: MenuItemResponse

    class Config:
        from_attributes = True

# Order schemas
class OrderCreate(BaseModel):
    outlet_id: int
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: str

class OrderResponse(BaseModel):
    id: int
    user_id: int
    outlet_id: int
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse]
    outlet: OutletBase

    class Config:
        from_attributes = True

# Analytics / Stats for Outlet Owner
class OutletStats(BaseModel):
    total_orders: int
    total_revenue: float
    pending_orders: int
