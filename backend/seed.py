import os
import sys

# Ensure backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app import models

def seed_db():
    print("Re-creating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Creating users...")
        # Password hash is prefix 'hashed_' for demo simplification
        student = models.User(
            name="Rahul Sharma",
            email="student@bennett.edu.in",
            password_hash="hashed_student123",
            role="student"
        )
        db.add(student)
        
        admin = models.User(
            name="Food Department Head",
            email="admin@bennett.edu.in",
            password_hash="hashed_admin123",
            role="admin"
        )
        db.add(admin)
        db.commit()

        print("Creating outlets...")
        outlets_data = [
            {
                "name": "Dev's Cafe",
                "location": "Ground Floor, Block H (Near Main Lawns)",
                "image_url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=60",
                "is_open": True
            },
            {
                "name": "Kathi Roll Junction",
                "location": "Tuck Shop Area (Block F)",
                "image_url": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=60",
                "is_open": True
            },
            {
                "name": "Maggi & Tea Hotspot",
                "location": "Boys Hostel 1 Courtyard",
                "image_url": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500&auto=format&fit=crop&q=60",
                "is_open": True
            },
            {
                "name": "BUN Mess Menu Helper",
                "location": "Student Mess (Ground Floor, Block D)",
                "image_url": "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=500&auto=format&fit=crop&q=60",
                "is_open": True
            }
        ]

        outlets = []
        for o_data in outlets_data:
            outlet = models.Outlet(**o_data)
            db.add(outlet)
            db.commit()
            db.refresh(outlet)
            outlets.append(outlet)

        devs_cafe = outlets[0]
        kathi_junction = outlets[1]
        maggi_hotspot = outlets[2]
        mess_outlet = outlets[3]

        print("Seeding outlet owners...")
        owner1 = models.User(
            name="Devendra Singh",
            email="owner@bennett.edu.in",
            password_hash="hashed_owner123",
            role="owner",
            outlet_id=devs_cafe.id
        )
        owner2 = models.User(
            name="Kathi Shop Owner",
            email="kathi_owner@bennett.edu.in",
            password_hash="hashed_owner123",
            role="owner",
            outlet_id=kathi_junction.id
        )
        owner3 = models.User(
            name="Maggi Shop Owner",
            email="maggi_owner@bennett.edu.in",
            password_hash="hashed_owner123",
            role="owner",
            outlet_id=maggi_hotspot.id
        )
        owner4 = models.User(
            name="Mess Coordinator",
            email="mess_coordinator@bennett.edu.in",
            password_hash="hashed_owner123",
            role="owner",
            outlet_id=mess_outlet.id
        )
        db.add(owner1)
        db.add(owner2)
        db.add(owner3)
        db.add(owner4)
        db.commit()

        print("Adding Dev's Cafe Menu Items...")
        dev_items = [
            {"name": "Cold Coffee with Ice Cream", "description": "Rich creamy espresso blended with vanilla ice cream", "price": 90.0, "category": "Beverages", "is_veg": True},
            {"name": "Paneer Tikka Grilled Sandwich", "description": "Spicy paneer tikka stuffed inside whole wheat grilled bread", "price": 120.0, "category": "Snacks", "is_veg": True},
            {"name": "Chicken Club Sandwich", "description": "Double decker toasted bread with grilled chicken, egg, lettuce and mayo", "price": 140.0, "category": "Snacks", "is_veg": False},
            {"name": "Chocolate Brownie Fudge", "description": "Warm chocolate brownie topped with chocolate hot fudge", "price": 80.0, "category": "Desserts", "is_veg": True},
            {"name": "Iced Peach Tea", "description": "Refreshing cold brewed tea infused with peach syrup", "price": 70.0, "category": "Beverages", "is_veg": True},
        ]
        for item in dev_items:
            db.add(models.MenuItem(**item, outlet_id=devs_cafe.id))

        print("Adding Kathi Roll Junction Menu Items...")
        kathi_items = [
            {"name": "Double Egg Roll", "description": "Fresh flatbread wrapped with 2 eggs, onions, mint sauce", "price": 75.0, "category": "Rolls", "is_veg": False},
            {"name": "Single Paneer Tikka Roll", "description": "Marinated paneer chunks grilled and wrapped with fresh veggies", "price": 90.0, "category": "Rolls", "is_veg": True},
            {"name": "Double Chicken Roll", "description": "Extra loaded grilled chicken wrapped with pickled onion and spicy chutney", "price": 120.0, "category": "Rolls", "is_veg": False},
            {"name": "Masala Fries", "description": "Crispy golden potato fries tossed in spicy peri-peri masala", "price": 60.0, "category": "Sides", "is_veg": True},
            {"name": "Fresh Lime Soda", "description": "Sweet and salty fizz with fresh squeezed lemon juice", "price": 40.0, "category": "Beverages", "is_veg": True},
        ]
        for item in kathi_items:
            db.add(models.MenuItem(**item, outlet_id=kathi_junction.id))

        print("Adding Maggi & Tea Hotspot Menu Items...")
        maggi_items = [
            {"name": "Classic Butter Maggi", "description": "Comforting hot maggi prepared with lots of butter", "price": 45.0, "category": "Maggi", "is_veg": True},
            {"name": "Cheese & Corn Maggi", "description": "Maggi topped with melted cheddar cheese and sweet corn", "price": 65.0, "category": "Maggi", "is_veg": True},
            {"name": "Spicy Egg & Veg Maggi", "description": "Maggi cooked with scrambled egg, onions, capsicum and green chillies", "price": 75.0, "category": "Maggi", "is_veg": False},
            {"name": "Adrak Elaichi Chai (Ginger Cardamom)", "description": "Special university student hot brewed milk tea", "price": 20.0, "category": "Teas", "is_veg": True},
            {"name": "Hot Chocolate", "description": "Creamy rich steamed cocoa drink", "price": 60.0, "category": "Beverages", "is_veg": True},
        ]
        for item in maggi_items:
            db.add(models.MenuItem(**item, outlet_id=maggi_hotspot.id))

        print("Adding Mess Helper Menu Items...")
        mess_items = [
            {"name": "Breakfast: Poha, Sprouts, Boiled Eggs, Tea", "description": "Served 7:30 AM to 9:30 AM", "price": 0.0, "category": "Mess Menu", "is_veg": True},
            {"name": "Lunch: Paneer Butter Masala, Dal Makhani, Roti, Rice, Boondi Raita", "description": "Served 12:30 PM to 2:30 PM", "price": 0.0, "category": "Mess Menu", "is_veg": True},
            {"name": "Snacks: Veg Samosa with Mint Chutney, Tea/Coffee", "description": "Served 5:00 PM to 6:30 PM", "price": 0.0, "category": "Mess Menu", "is_veg": True},
            {"name": "Dinner: Chicken Curry / Shahi Paneer, Jeera Aloo, Mix Dal, Tandoori Roti, Rice, Kheer", "description": "Served 7:30 PM to 9:30 PM", "price": 0.0, "category": "Mess Menu", "is_veg": True},
        ]
        for item in mess_items:
            db.add(models.MenuItem(**item, outlet_id=mess_outlet.id))

        db.commit()
        print("Database successfully seeded!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
