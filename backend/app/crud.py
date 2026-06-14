import hashlib
import secrets
from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime

# Password hashing helpers
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    iterations = 100000
    hash_bytes = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        iterations
    )
    hash_hex = hash_bytes.hex()
    return f"pbkdf2_sha256${iterations}${salt}${hash_hex}"

def verify_password(password: str, hashed: str) -> bool:
    if not hashed:
        return False
    # Backward compatibility with old hashed_ format for local seeding/testing
    if hashed.startswith("hashed_"):
        return hashed == f"hashed_{password}"
    
    parts = hashed.split('$')
    if len(parts) != 4 or parts[0] != 'pbkdf2_sha256':
        return False
    
    try:
        iterations = int(parts[1])
        salt = parts[2]
        hash_hex = parts[3]
        
        test_bytes = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            iterations
        )
        return secrets.compare_digest(test_bytes.hex(), hash_hex)
    except ValueError:
        return False

# User operations
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role,
        outlet_id=user.outlet_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# Outlet operations
def get_outlets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Outlet).offset(skip).limit(limit).all()

def get_outlet(db: Session, outlet_id: int):
    return db.query(models.Outlet).filter(models.Outlet.id == outlet_id).first()

def create_outlet(db: Session, outlet: schemas.OutletCreate):
    db_outlet = models.Outlet(**outlet.model_dump())
    db.add(db_outlet)
    db.commit()
    db.refresh(db_outlet)
    return db_outlet

def update_outlet_status(db: Session, outlet_id: int, is_open: bool):
    db_outlet = get_outlet(db, outlet_id)
    if db_outlet:
        db_outlet.is_open = is_open
        db.commit()
        db.refresh(db_outlet)
    return db_outlet

# MenuItem operations
def create_menu_item(db: Session, item: schemas.MenuItemCreate, outlet_id: int):
    db_item = models.MenuItem(**item.model_dump(), outlet_id=outlet_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_menu_items(db: Session, outlet_id: int):
    return db.query(models.MenuItem).filter(models.MenuItem.outlet_id == outlet_id).all()

def update_menu_item_availability(db: Session, item_id: int, is_available: bool):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if db_item:
        db_item.is_available = is_available
        db.commit()
        db.refresh(db_item)
    return db_item

def update_menu_item(db: Session, item_id: int, item_update: schemas.MenuItemCreate):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if db_item:
        for key, value in item_update.model_dump().items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_menu_item(db: Session, item_id: int):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False

# Order operations
def create_order(db: Session, order: schemas.OrderCreate, user_id: int):
    # First, let's compute the total amount by fetching the prices of the menu items
    total_amount = 0.0
    order_items_to_create = []

    for item_in in order.items:
        menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_in.menu_item_id).first()
        if not menu_item:
            continue
        price_at_order = menu_item.price
        total_amount += price_at_order * item_in.quantity
        
        order_items_to_create.append(
            models.OrderItem(
                menu_item_id=item_in.menu_item_id,
                quantity=item_in.quantity,
                price_at_order=price_at_order
            )
        )

    db_order = models.Order(
        user_id=user_id,
        outlet_id=order.outlet_id,
        total_amount=total_amount,
        status="pending",
        payment_method=order.payment_method,
        payment_status="completed" if order.payment_method == "upi" else "pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Add order items with the generated order id
    for order_item in order_items_to_create:
        order_item.order_id = db_order.id
        db.add(order_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def get_orders_by_user(db: Session, user_id: int):
    return db.query(models.Order).filter(models.Order.user_id == user_id).order_by(models.Order.created_at.desc()).all()

def get_orders_by_outlet(db: Session, outlet_id: int):
    return db.query(models.Order).filter(models.Order.outlet_id == outlet_id).order_by(models.Order.created_at.desc()).all()

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def update_order_status(db: Session, order_id: int, status: str):
    db_order = get_order(db, order_id)
    if db_order:
        db_order.status = status
        db.commit()
        db.refresh(db_order)
    return db_order

# Analytics stats
def get_outlet_stats(db: Session, outlet_id: int):
    orders = db.query(models.Order).filter(models.Order.outlet_id == outlet_id).all()
    total_orders = len(orders)
    total_revenue = sum(o.total_amount for o in orders if o.status == "completed")
    pending_orders = len([o for o in orders if o.status in ["pending", "preparing", "ready"]])
    return schemas.OutletStats(
        total_orders=total_orders,
        total_revenue=total_revenue,
        pending_orders=pending_orders
    )

def delete_outlet(db: Session, outlet_id: int):
    # Delete related menu items first
    db.query(models.MenuItem).filter(models.MenuItem.outlet_id == outlet_id).delete()
    # Delete related orders and order items
    orders = db.query(models.Order).filter(models.Order.outlet_id == outlet_id).all()
    for order in orders:
        db.query(models.OrderItem).filter(models.OrderItem.order_id == order.id).delete()
        db.delete(order)
    # Reset outlet_id for any users assigned to this outlet
    db.query(models.User).filter(models.User.outlet_id == outlet_id).update({models.User.outlet_id: None})
    
    db_outlet = db.query(models.Outlet).filter(models.Outlet.id == outlet_id).first()
    if db_outlet:
        db.delete(db_outlet)
        db.commit()
        return True
    return False

def update_outlet_details(db: Session, outlet_id: int, name: str, location: str, image_url: str):
    db_outlet = db.query(models.Outlet).filter(models.Outlet.id == outlet_id).first()
    if db_outlet:
        db_outlet.name = name
        db_outlet.location = location
        db_outlet.image_url = image_url
        db.commit()
        db.refresh(db_outlet)
    return db_outlet

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def update_user_outlet(db: Session, user_id: int, outlet_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.outlet_id = outlet_id if outlet_id and outlet_id > 0 else None
        db.commit()
        db.refresh(db_user)
    return db_user
