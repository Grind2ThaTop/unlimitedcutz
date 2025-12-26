-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view their downline" ON public.matrix_nodes;

-- Recreate a non-recursive policy - users can view their own node only
-- (downline viewing should be done differently, not via self-referencing RLS)
CREATE POLICY "Users can view their own matrix node v2" 
ON public.matrix_nodes 
FOR SELECT 
USING (auth.uid() = user_id);