-- Create a security definer function to check if a user is an ancestor of a matrix node
-- This avoids infinite recursion in RLS by using a function with elevated privileges

CREATE OR REPLACE FUNCTION public.is_matrix_ancestor(_user_id uuid, _node_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE ancestors AS (
    -- Start with the node we're checking
    SELECT id, user_id, parent_id, 1 as depth
    FROM public.matrix_nodes
    WHERE user_id = _node_user_id
    
    UNION ALL
    
    -- Traverse up the tree through parent_id
    SELECT mn.id, mn.user_id, mn.parent_id, a.depth + 1
    FROM public.matrix_nodes mn
    INNER JOIN ancestors a ON mn.id = a.parent_id
    WHERE a.depth < 20  -- Safety limit to prevent infinite loops
  )
  SELECT EXISTS (
    SELECT 1 FROM ancestors WHERE user_id = _user_id
  )
$$;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own matrix node v2" ON public.matrix_nodes;

-- Create new policy that allows viewing own node AND downline
CREATE POLICY "Users can view their matrix tree"
ON public.matrix_nodes
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_matrix_ancestor(auth.uid(), user_id)
);