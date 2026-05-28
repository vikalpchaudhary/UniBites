import React, { useState, useEffect } from 'react';

const MESS_WEEK_MENU = {
  Monday: {
    Breakfast: "Poha, Sprouts, Boiled Eggs / Bananas, Tea & Coffee",
    Lunch: "Rajma Masala, Aloo Jeera, Plain Rice, Butter Roti, Curd, Salad",
    Snacks: "Samosa with Mint Chutney, Tea & Coffee",
    Dinner: "Paneer Bhurji / Chicken Masala, Dal Tadka, Rice, Roti, Ice Cream"
  },
  Tuesday: {
    Breakfast: "Idli Sambar, Coconut Chutney, Fruit Bowl, Tea & Coffee",
    Lunch: "Kadhi Pakora, Aloo Gobhi, Jeera Rice, Tandoori Roti, Boondi Raita",
    Snacks: "Veg Cutlet, Tea & Coffee",
    Dinner: "Egg Curry / Kadai Paneer, Mix Veg, Moong Dal, Roti, Rice, Gulab Jamun"
  },
  Wednesday: {
    Breakfast: "Aloo Paratha, Butter, Pickle, Dahi, Tea & Coffee",
    Lunch: "Chole Bhature / Rice, Aloo Beans, Boondi Raita, Salad",
    Snacks: "Pav Bhaji, Tea & Coffee",
    Dinner: "Butter Chicken / Shahi Paneer, Dal Makhani, Veg Pulao, Butter Naan, Sewai Kheer"
  },
  Thursday: {
    Breakfast: "Veg Sandwich, Cornflakes with Milk, Boiled Eggs, Tea",
    Lunch: "Kashmiri Dum Aloo, Black Chana, Steamed Rice, Roti, Curd",
    Snacks: "Bread Pakora, Tea & Coffee",
    Dinner: "Malai Kofta, Mix Dal, Jeera Rice, Tandoori Roti, Custard Dessert"
  },
  Friday: {
    Breakfast: "Uttapam, Tomato Chutney, Sprouts Salad, Tea & Coffee",
    Lunch: "Veg Biryani, Salan, Raita, Aloo Methi, Roti, Salad",
    Snacks: "Kachori with Chutney, Tea & Coffee",
    Dinner: "Chicken Korma / Matar Paneer, Dal Fry, Plain Rice, Roti, Kheer"
  },
  Saturday: {
    Breakfast: "Methi Paratha, White Butter, Curd, Tea & Coffee",
    Lunch: "Aloo Poori, Sooji Halwa, Chana Masala, Salad",
    Snacks: "Aloo Bonda, Tea & Coffee",
    Dinner: "Paneer Butter Masala, Yellow Dal, Veg Fried Rice, Butter Roti, Rasgulla"
  },
  Sunday: {
    Breakfast: "Chole Poori, Pickle, Fresh Fruit Juice, Tea & Coffee",
    Lunch: "Special Veg Pulao, Paneer Do Pyaza, Dal Fry, Roti, Dahi",
    Snacks: "Miska Pakora (Paneer/Onion), Tea & Coffee",
    Dinner: "Chicken Biryani / Paneer Tikka Masala, Dal Makhani, Rumali Roti, Ice Cream"
  }
};

export default function MessHelper() {
  const [activeDay, setActiveDay] = useState('Monday');
  const [currentMeal, setCurrentMeal] = useState('');
  const [timeStr, setTimeStr] = useState('');

  // Determine active day & active meal on mount
  useEffect(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const dayName = days[now.getDay()];
    setActiveDay(dayName);

    const hours = now.getHours();
    const minutes = now.getMinutes();
    setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    // Meal Timings:
    // Breakfast: 7:30 to 9:30 (7.5 to 9.5)
    // Lunch: 12:30 to 14:30 (12.5 to 14.5)
    // Snacks: 17:00 to 18:30 (17 to 18.5)
    // Dinner: 19:30 to 21:30 (19.5 to 21.5)
    const decimalTime = hours + minutes / 60;

    if (decimalTime >= 7.5 && decimalTime <= 9.5) {
      setCurrentMeal('Breakfast');
    } else if (decimalTime >= 12.5 && decimalTime <= 14.5) {
      setCurrentMeal('Lunch');
    } else if (decimalTime >= 17 && decimalTime <= 18.5) {
      setCurrentMeal('Snacks');
    } else if (decimalTime >= 19.5 && decimalTime <= 21.5) {
      setCurrentMeal('Dinner');
    } else {
      setCurrentMeal('None');
    }
  }, []);

  const getMealStatusText = () => {
    if (currentMeal === 'None') {
      return "No active mess dining hours right now. Next meal is on schedule.";
    }
    return `🍴 It is currently ${currentMeal} hours (${timeStr}). Mess hall is open!`;
  };

  const getMealTimeRange = (meal) => {
    switch(meal) {
      case 'Breakfast': return '07:30 AM - 09:30 AM';
      case 'Lunch': return '12:30 PM - 02:30 PM';
      case 'Snacks': return '05:00 PM - 06:30 PM';
      case 'Dinner': return '07:30 PM - 09:30 PM';
      default: return '';
    }
  };

  return (
    <div className="animate-fade-in">
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(59, 130, 246, 0.06) 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>🍲 Student Mess Menu Helper</h1>
          <p style={{ color: 'var(--text-muted)' }}>Bennett University Central Mess Schedule</p>
        </div>
        <div className="glass-card" style={{ padding: '12px 24px', borderColor: currentMeal !== 'None' ? 'var(--success)' : 'var(--border-color)' }}>
          <span style={{ fontWeight: 600, color: currentMeal !== 'None' ? 'var(--success)' : 'var(--text-muted)' }}>
            {getMealStatusText()}
          </span>
        </div>
      </div>

      {/* Weekday Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '32px' }}>
        {Object.keys(MESS_WEEK_MENU).map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            style={{
              background: activeDay === day ? 'var(--primary)' : 'rgba(15, 23, 42, 0.05)',
              color: activeDay === day ? 'white' : 'var(--text-muted)',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '24px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'var(--transition)',
              whiteSpace: 'nowrap'
            }}
          >
            {day} {new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day && '📍'}
          </button>
        ))}
      </div>

      {/* Meal Cards Display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {Object.entries(MESS_WEEK_MENU[activeDay]).map(([mealType, menuContent]) => {
          const isOngoing = currentMeal === mealType && new Date().toLocaleDateString('en-US', { weekday: 'long' }) === activeDay;

          return (
            <div 
              key={mealType} 
              className="glass-card" 
              style={{ 
                padding: '24px', 
                borderTop: isOngoing ? '4px solid var(--success)' : '1px solid var(--border-color)',
                transform: isOngoing ? 'scale(1.02)' : 'none',
                boxShadow: isOngoing ? '0 10px 25px rgba(16, 185, 129, 0.15)' : 'var(--shadow)',
                background: isOngoing ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{mealType}</h3>
                {isOngoing && (
                  <span className="tag tag-veg" style={{ fontSize: '0.6rem', padding: '4px 8px' }}>
                    🟢 Active Now
                  </span>
                )}
              </div>
              
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                ⏰ {getMealTimeRange(mealType)}
              </span>

              <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-main)', minHeight: '80px' }}>
                {menuContent}
              </p>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Mess passes required at entry points.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
