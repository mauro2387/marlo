-- ===========================================
-- FIX: Agregar ON DELETE CASCADE a todas las FK que lo necesitan
-- Ejecutar en Supabase SQL Editor
-- ===========================================

-- 1. COUPON_USES -> orders (ya existe en fix-coupon-uses-cascade.sql)
ALTER TABLE public.coupon_uses
DROP CONSTRAINT IF EXISTS coupon_uses_order_id_fkey;

ALTER TABLE public.coupon_uses
ADD CONSTRAINT coupon_uses_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES public.orders(id)
ON DELETE CASCADE;

-- 2. COUPON_USES -> coupons
ALTER TABLE public.coupon_uses
DROP CONSTRAINT IF EXISTS coupon_uses_coupon_id_fkey;

ALTER TABLE public.coupon_uses
ADD CONSTRAINT coupon_uses_coupon_id_fkey
FOREIGN KEY (coupon_id)
REFERENCES public.coupons(id)
ON DELETE CASCADE;

-- 3. COUPON_USES -> users (SET NULL para mantener historial)
ALTER TABLE public.coupon_uses
DROP CONSTRAINT IF EXISTS coupon_uses_user_id_fkey;

ALTER TABLE public.coupon_uses
ADD CONSTRAINT coupon_uses_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE SET NULL;

-- 4. ORDER_ITEMS -> orders
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES public.orders(id)
ON DELETE CASCADE;

-- 5. ORDER_ITEMS -> products (SET NULL para mantener historial)
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE SET NULL;

-- 6. LOYALTY_HISTORY -> users
ALTER TABLE public.loyalty_history
DROP CONSTRAINT IF EXISTS loyalty_history_user_id_fkey;

ALTER TABLE public.loyalty_history
ADD CONSTRAINT loyalty_history_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- 7. LOYALTY_HISTORY -> orders (SET NULL)
ALTER TABLE public.loyalty_history
DROP CONSTRAINT IF EXISTS loyalty_history_order_id_fkey;

ALTER TABLE public.loyalty_history
ADD CONSTRAINT loyalty_history_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES public.orders(id)
ON DELETE SET NULL;

-- 8. NOTIFICATIONS -> users
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- 9. REWARD_REDEMPTIONS -> orders (SET NULL)
ALTER TABLE public.reward_redemptions
DROP CONSTRAINT IF EXISTS reward_redemptions_order_id_fkey;

ALTER TABLE public.reward_redemptions
ADD CONSTRAINT reward_redemptions_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES public.orders(id)
ON DELETE SET NULL;

-- 10. REWARD_REDEMPTIONS -> rewards (SET NULL)
ALTER TABLE public.reward_redemptions
DROP CONSTRAINT IF EXISTS reward_redemptions_reward_id_fkey;

ALTER TABLE public.reward_redemptions
ADD CONSTRAINT reward_redemptions_reward_id_fkey
FOREIGN KEY (reward_id)
REFERENCES public.rewards(id)
ON DELETE SET NULL;

-- 11. POPUP_COUPONS -> popups
ALTER TABLE public.popup_coupons
DROP CONSTRAINT IF EXISTS popup_coupons_popup_id_fkey;

ALTER TABLE public.popup_coupons
ADD CONSTRAINT popup_coupons_popup_id_fkey
FOREIGN KEY (popup_id)
REFERENCES public.popups(id)
ON DELETE CASCADE;

-- 12. POPUP_COUPONS -> coupons
ALTER TABLE public.popup_coupons
DROP CONSTRAINT IF EXISTS popup_coupons_coupon_id_fkey;

ALTER TABLE public.popup_coupons
ADD CONSTRAINT popup_coupons_coupon_id_fkey
FOREIGN KEY (coupon_id)
REFERENCES public.coupons(id)
ON DELETE SET NULL;

-- Verificar que se aplicaron correctamente
SELECT 
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  CASE confdeltype
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'r' THEN 'RESTRICT'
    WHEN 'c' THEN 'CASCADE'
    WHEN 'n' THEN 'SET NULL'
    WHEN 'd' THEN 'SET DEFAULT'
  END AS delete_action
FROM pg_constraint
WHERE contype = 'f'
  AND conrelid::regclass::text IN (
    'coupon_uses', 'order_items', 'loyalty_history', 
    'notifications', 'reward_redemptions', 'popup_coupons'
  )
ORDER BY table_name, constraint_name;
