-- ====================================================================
-- RestaurantOS — Production Row Level Security (RLS) Policies
-- Security definitions for Supabase PostgreSQL database
-- ====================================================================

-- 1. SECURITY DEFINER HELPER FUNCTIONS
-- Fast, cached role lookups preventing recursive RLS checks

CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS VARCHAR(50) AS $$
DECLARE
    r_name VARCHAR(50);
BEGIN
    SELECT r.name INTO r_name
    FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid();
    
    RETURN COALESCE(r_name, 'Customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (get_auth_role() = 'Admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_manager_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (get_auth_role() IN ('Admin', 'Manager'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_staff_member()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (get_auth_role() IN ('Admin', 'Manager', 'Chef', 'Waiter', 'Cashier', 'Staff'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ====================================================================
-- 2. ROLES TABLE POLICIES
-- ====================================================================

DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
CREATE POLICY "Anyone can view roles"
    ON roles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage roles" ON roles;
CREATE POLICY "Admins can manage roles"
    ON roles FOR ALL
    USING (is_admin());

-- ====================================================================
-- 3. PROFILES TABLE POLICIES
-- ====================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid() OR is_staff_member());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid() OR is_admin())
    WITH CHECK (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
CREATE POLICY "Admins can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (true);

-- ====================================================================
-- 4. MENU CATEGORIES & ITEMS POLICIES (Customer: Read menu)
-- ====================================================================

DROP POLICY IF EXISTS "Anyone can view menu categories" ON menu_categories;
CREATE POLICY "Anyone can view menu categories"
    ON menu_categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Managers can manage menu categories" ON menu_categories;
CREATE POLICY "Managers can manage menu categories"
    ON menu_categories FOR ALL
    USING (is_manager_or_admin());

DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
CREATE POLICY "Anyone can view menu items"
    ON menu_items FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Managers can manage menu items" ON menu_items;
CREATE POLICY "Managers can manage menu items"
    ON menu_items FOR ALL
    USING (is_manager_or_admin());

-- ====================================================================
-- 5. RESTAURANT TABLES POLICIES (Staff/Waiter: Update table status)
-- ====================================================================

DROP POLICY IF EXISTS "Anyone can view tables" ON restaurant_tables;
CREATE POLICY "Anyone can view tables"
    ON restaurant_tables FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Staff can update table status" ON restaurant_tables;
CREATE POLICY "Staff can update table status"
    ON restaurant_tables FOR UPDATE
    USING (is_staff_member() OR get_auth_role() = 'Waiter')
    WITH CHECK (is_staff_member() OR get_auth_role() = 'Waiter');

DROP POLICY IF EXISTS "Managers can manage tables" ON restaurant_tables;
CREATE POLICY "Managers can manage tables"
    ON restaurant_tables FOR ALL
    USING (is_manager_or_admin());

-- ====================================================================
-- 6. RESERVATIONS POLICIES (Customer: Create, Staff: Read)
-- ====================================================================

DROP POLICY IF EXISTS "Customers can view own reservations" ON reservations;
CREATE POLICY "Customers can view own reservations"
    ON reservations FOR SELECT
    USING (customer_id = auth.uid() OR is_staff_member());

DROP POLICY IF EXISTS "Customers can create reservations" ON reservations;
CREATE POLICY "Customers can create reservations"
    ON reservations FOR INSERT
    WITH CHECK (auth.uid() IS NULL OR customer_id = auth.uid() OR is_staff_member());

DROP POLICY IF EXISTS "Staff can update reservations" ON reservations;
CREATE POLICY "Staff can update reservations"
    ON reservations FOR UPDATE
    USING (is_staff_member())
    WITH CHECK (is_staff_member());

DROP POLICY IF EXISTS "Managers can delete reservations" ON reservations;
CREATE POLICY "Managers can delete reservations"
    ON reservations FOR DELETE
    USING (is_manager_or_admin());

-- ====================================================================
-- 7. ORDERS POLICIES (Customer: Create & read own, Staff/Chef: Update)
-- ====================================================================

DROP POLICY IF EXISTS "Customers view own orders, Staff view all" ON orders;
CREATE POLICY "Customers view own orders, Staff view all"
    ON orders FOR SELECT
    USING (customer_id = auth.uid() OR is_staff_member());

DROP POLICY IF EXISTS "Customers and Staff can create orders" ON orders;
CREATE POLICY "Customers and Staff can create orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() IS NULL OR customer_id = auth.uid() OR is_staff_member());

DROP POLICY IF EXISTS "Staff and Chef can update orders" ON orders;
CREATE POLICY "Staff and Chef can update orders"
    ON orders FOR UPDATE
    USING (is_staff_member() OR get_auth_role() = 'Chef')
    WITH CHECK (is_staff_member() OR get_auth_role() = 'Chef');

DROP POLICY IF EXISTS "Managers can delete orders" ON orders;
CREATE POLICY "Managers can delete orders"
    ON orders FOR DELETE
    USING (is_manager_or_admin());

-- ====================================================================
-- 8. ORDER ITEMS POLICIES
-- ====================================================================

DROP POLICY IF EXISTS "Customers view own order items, Staff view all" ON order_items;
CREATE POLICY "Customers view own order items, Staff view all"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders o 
            WHERE o.id = order_items.order_id 
              AND (o.customer_id = auth.uid() OR is_staff_member())
        )
    );

DROP POLICY IF EXISTS "Customers and Staff can insert order items" ON order_items;
CREATE POLICY "Customers and Staff can insert order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders o 
            WHERE o.id = order_items.order_id 
              AND (o.customer_id = auth.uid() OR is_staff_member())
        )
    );

DROP POLICY IF EXISTS "Staff can update order items" ON order_items;
CREATE POLICY "Staff can update order items"
    ON order_items FOR UPDATE
    USING (is_staff_member())
    WITH CHECK (is_staff_member());

-- ====================================================================
-- 9. INVENTORY & LOGS POLICIES
-- ====================================================================

DROP POLICY IF EXISTS "Staff can view inventory" ON inventory;
CREATE POLICY "Staff can view inventory"
    ON inventory FOR SELECT
    USING (is_staff_member());

DROP POLICY IF EXISTS "Staff can update inventory stock" ON inventory;
CREATE POLICY "Staff can update inventory stock"
    ON inventory FOR UPDATE
    USING (is_staff_member())
    WITH CHECK (is_staff_member());

DROP POLICY IF EXISTS "Managers can manage inventory" ON inventory;
CREATE POLICY "Managers can manage inventory"
    ON inventory FOR ALL
    USING (is_manager_or_admin());

DROP POLICY IF EXISTS "Staff can view and insert inventory logs" ON inventory_logs;
CREATE POLICY "Staff can view and insert inventory logs"
    ON inventory_logs FOR ALL
    USING (is_staff_member());

-- ====================================================================
-- 10. PAYMENTS POLICIES (Cashier: Manage payments)
-- ====================================================================

DROP POLICY IF EXISTS "Customers view own payments, Staff view all" ON payments;
CREATE POLICY "Customers view own payments, Staff view all"
    ON payments FOR SELECT
    USING (customer_id = auth.uid() OR is_staff_member());

DROP POLICY IF EXISTS "Cashier and Staff can manage payments" ON payments;
CREATE POLICY "Cashier and Staff can manage payments"
    ON payments FOR ALL
    USING (get_auth_role() = 'Cashier' OR is_manager_or_admin() OR is_staff_member());

-- ====================================================================
-- 11. NOTIFICATIONS POLICIES
-- ====================================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid() OR is_staff_member());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff can insert notifications" ON notifications;
CREATE POLICY "Staff can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (is_staff_member());

-- ====================================================================
-- 12. FEEDBACK POLICIES
-- ====================================================================

DROP POLICY IF EXISTS "Customers can submit feedback" ON feedback;
CREATE POLICY "Customers can submit feedback"
    ON feedback FOR INSERT
    WITH CHECK (customer_id = auth.uid() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Customers view own feedback, Staff view all" ON feedback;
CREATE POLICY "Customers view own feedback, Staff view all"
    ON feedback FOR SELECT
    USING (customer_id = auth.uid() OR is_staff_member());

-- ====================================================================
-- 13. STAFF ACTIVITY & DAILY SALES POLICIES (Manager/Admin: Full access)
-- ====================================================================

DROP POLICY IF EXISTS "Staff insert and Managers view activity" ON staff_activity;
CREATE POLICY "Staff insert and Managers view activity"
    ON staff_activity FOR ALL
    USING (is_staff_member());

DROP POLICY IF EXISTS "Managers can manage daily sales" ON daily_sales;
CREATE POLICY "Managers can manage daily sales"
    ON daily_sales FOR ALL
    USING (is_manager_or_admin());
