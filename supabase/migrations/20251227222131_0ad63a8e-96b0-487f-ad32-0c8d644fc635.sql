
-- Create function to auto-place new users in matrix on signup
CREATE OR REPLACE FUNCTION public.auto_place_in_matrix()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_position_index INTEGER;
  parent_node RECORD;
  new_node_id UUID;
  child_position INTEGER;
BEGIN
  -- Get next position index
  SELECT COALESCE(MAX(position_index), 0) + 1 INTO next_position_index FROM matrix_nodes;
  
  -- If this is the first user (root)
  IF next_position_index = 1 THEN
    INSERT INTO matrix_nodes (user_id, level, position_index, placement_source, placed_at)
    VALUES (NEW.id, 1, 1, 'direct_signup', now())
    RETURNING id INTO new_node_id;
  ELSE
    -- Find parent with available slot (BFS order)
    SELECT mn.id, mn.user_id, mn.level,
           CASE 
             WHEN mn.left_child IS NULL THEN 1
             WHEN mn.middle_child IS NULL THEN 2
             WHEN mn.right_child IS NULL THEN 3
           END as available_position
    INTO parent_node
    FROM matrix_nodes mn
    WHERE mn.level < 8
      AND (mn.left_child IS NULL OR mn.middle_child IS NULL OR mn.right_child IS NULL)
    ORDER BY mn.position_index ASC
    LIMIT 1;
    
    IF parent_node IS NULL THEN
      RAISE EXCEPTION 'Matrix is full (8 levels reached)';
    END IF;
    
    -- Get sponsor from account_roles if exists
    -- Insert new node
    INSERT INTO matrix_nodes (
      user_id, parent_id, level, position, position_index, 
      placement_source, placed_at, sponsor_id
    )
    VALUES (
      NEW.id, 
      parent_node.id, 
      parent_node.level + 1, 
      parent_node.available_position,
      next_position_index,
      'direct_signup', 
      now(),
      (SELECT sponsor_id FROM account_roles WHERE user_id = NEW.id LIMIT 1)
    )
    RETURNING id INTO new_node_id;
    
    -- Update parent's child pointer
    IF parent_node.available_position = 1 THEN
      UPDATE matrix_nodes SET left_child = new_node_id WHERE id = parent_node.id;
    ELSIF parent_node.available_position = 2 THEN
      UPDATE matrix_nodes SET middle_child = new_node_id WHERE id = parent_node.id;
    ELSE
      UPDATE matrix_nodes SET right_child = new_node_id WHERE id = parent_node.id;
    END IF;
  END IF;
  
  -- Create member_ranks entry (inactive until they pay)
  INSERT INTO member_ranks (user_id, is_active, current_rank)
  VALUES (NEW.id, false, 'bronze')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_created_place_in_matrix ON profiles;
CREATE TRIGGER on_profile_created_place_in_matrix
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_place_in_matrix();
