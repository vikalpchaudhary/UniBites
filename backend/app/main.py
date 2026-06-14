import jwt
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from typing import List

from app.database import engine, Base, get_db
from app import models, schemas, crud

# JWT Configurations
SECRET_KEY = "unibites_secret_key_12345!"
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, List[WebSocket]] = {}

    async def connect(self, ws_key: str, websocket: WebSocket):
        await websocket.accept()
        if ws_key not in self.active_connections:
            self.active_connections[ws_key] = []
        self.active_connections[ws_key].append(websocket)

    def disconnect(self, ws_key: str, websocket: WebSocket):
        if ws_key in self.active_connections:
            if websocket in self.active_connections[ws_key]:
                self.active_connections[ws_key].remove(websocket)
            if not self.active_connections[ws_key]:
                del self.active_connections[ws_key]

    async def send_personal_message(self, message: dict, ws_key: str):
        if ws_key in self.active_connections:
            for connection in self.active_connections[ws_key]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

    async def broadcast(self, message: dict):
        for ws_key, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="UniBites API",
    description="Backend API for UniBites food ordering application at Bennett University",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)
    try:
        while True:
            # Keep connection alive & listen for potential messages (usually client-to-server)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(client_id, websocket)

@app.get("/")
def read_root():
    return {"message": "Welcome to UniBites API. Visit /docs for Swagger documentation."}

# Auth Routes
@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    return crud.create_user(db=db, user=user)

@app.post("/api/auth/login", response_model=schemas.LoginResponse)
def login_user(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=login_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not crud.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Generate token
    token_data = {
        "sub": user.email,
        "id": user.id,
        "name": user.name,
        "role": user.role,
        "outlet_id": user.outlet_id
    }
    token = create_access_token(token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


# Outlet Routes
@app.get("/api/outlets", response_model=List[schemas.OutletResponse])
def read_outlets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    outlets = crud.get_outlets(db, skip=skip, limit=limit)
    return outlets

@app.get("/api/outlets/{outlet_id}", response_model=schemas.OutletResponse)
def read_outlet(outlet_id: int, db: Session = Depends(get_db)):
    db_outlet = crud.get_outlet(db, outlet_id=outlet_id)
    if db_outlet is None:
        raise HTTPException(status_code=404, detail="Outlet not found")
    return db_outlet

@app.post("/api/outlets", response_model=schemas.OutletResponse)
def create_outlet(outlet: schemas.OutletCreate, db: Session = Depends(get_db)):
    return crud.create_outlet(db=db, outlet=outlet)

@app.put("/api/outlets/{outlet_id}/status", response_model=schemas.OutletResponse)
def update_outlet_status(outlet_id: int, status_update: schemas.OutletBase, db: Session = Depends(get_db)):
    db_outlet = crud.update_outlet_status(db, outlet_id=outlet_id, is_open=status_update.is_open)
    if not db_outlet:
        raise HTTPException(status_code=404, detail="Outlet not found")
    return db_outlet

@app.get("/api/outlets/{outlet_id}/orders", response_model=List[schemas.OrderResponse])
def read_outlet_orders(outlet_id: int, db: Session = Depends(get_db)):
    return crud.get_orders_by_outlet(db, outlet_id=outlet_id)

@app.get("/api/outlets/{outlet_id}/stats", response_model=schemas.OutletStats)
def read_outlet_stats(outlet_id: int, db: Session = Depends(get_db)):
    return crud.get_outlet_stats(db, outlet_id=outlet_id)

# Menu Item Routes
@app.post("/api/outlets/{outlet_id}/items", response_model=schemas.MenuItemResponse)
def create_menu_item_for_outlet(outlet_id: int, item: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    db_outlet = crud.get_outlet(db, outlet_id=outlet_id)
    if not db_outlet:
        raise HTTPException(status_code=404, detail="Outlet not found")
    return crud.create_menu_item(db=db, item=item, outlet_id=outlet_id)

@app.put("/api/menu-items/{item_id}/availability")
def toggle_menu_item_availability(item_id: int, availability: schemas.MenuItemBase, db: Session = Depends(get_db)):
    db_item = crud.update_menu_item_availability(db, item_id=item_id, is_available=availability.is_available)
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Availability updated successfully", "is_available": db_item.is_available}

@app.put("/api/menu-items/{item_id}", response_model=schemas.MenuItemResponse)
def update_menu_item(item_id: int, item: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    db_item = crud.update_menu_item(db=db, item_id=item_id, item_update=item)
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return db_item

@app.delete("/api/menu-items/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    success = crud.delete_menu_item(db=db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Menu item deleted successfully"}

# Order Routes
@app.post("/api/orders", response_model=schemas.OrderResponse)
def place_order(order: schemas.OrderCreate, user_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # simple check if user exists
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # check if outlet exists and is open
    outlet = crud.get_outlet(db, order.outlet_id)
    if not outlet:
        raise HTTPException(status_code=404, detail="Outlet not found")
    if not outlet.is_open:
        raise HTTPException(status_code=400, detail="Outlet is currently closed")
        
    db_order = crud.create_order(db=db, order=order, user_id=user_id)
    
    # Send WebSocket broadcast to student and outlet
    order_data = jsonable_encoder(db_order)
    background_tasks.add_task(manager.send_personal_message, {"type": "order_created", "order": order_data}, f"user_{user_id}")
    background_tasks.add_task(manager.send_personal_message, {"type": "order_created", "order": order_data}, f"outlet_{db_order.outlet_id}")
    
    return db_order

@app.get("/api/orders/user/{user_id}", response_model=List[schemas.OrderResponse])
def read_user_orders(user_id: int, db: Session = Depends(get_db)):
    return crud.get_orders_by_user(db, user_id=user_id)

@app.get("/api/orders/{order_id}", response_model=schemas.OrderResponse)
def read_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud.get_order(db, order_id=order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@app.put("/api/orders/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(order_id: int, status_update: schemas.OrderStatusUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_order = crud.update_order_status(db, order_id=order_id, status=status_update.status)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Send WebSocket broadcast
    order_data = jsonable_encoder(db_order)
    background_tasks.add_task(manager.send_personal_message, {"type": "order_updated", "order": order_data}, f"user_{db_order.user_id}")
    background_tasks.add_task(manager.send_personal_message, {"type": "order_updated", "order": order_data}, f"outlet_{db_order.outlet_id}")
    
    return db_order

# Admin Outlet Management Routes
@app.put("/api/outlets/{outlet_id}", response_model=schemas.OutletResponse)
def update_outlet_info(outlet_id: int, outlet: schemas.OutletCreate, db: Session = Depends(get_db)):
    db_outlet = crud.update_outlet_details(
        db, 
        outlet_id=outlet_id, 
        name=outlet.name, 
        location=outlet.location, 
        image_url=outlet.image_url
    )
    if not db_outlet:
        raise HTTPException(status_code=404, detail="Outlet not found")
    return db_outlet

@app.delete("/api/outlets/{outlet_id}")
def remove_outlet(outlet_id: int, db: Session = Depends(get_db)):
    success = crud.delete_outlet(db, outlet_id=outlet_id)
    if not success:
        raise HTTPException(status_code=404, detail="Outlet not found")
    return {"message": "Outlet and its related records deleted successfully"}

# Admin User Management Routes
@app.get("/api/admin/users", response_model=List[schemas.UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@app.put("/api/admin/users/{user_id}/outlet", response_model=schemas.UserResponse)
def assign_user_to_outlet(user_id: int, assignment: schemas.UserOutletAssign, db: Session = Depends(get_db)):
    db_user = crud.update_user_outlet(db, user_id=user_id, outlet_id=assignment.outlet_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
