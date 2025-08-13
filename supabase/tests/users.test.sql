BEGIN;

create extension if not exists pgtap with schema extensions;

SELECT plan(10);

-- Create test users
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'user1@book.com', '{"firstName": "Greatest", "lastName": "Ever"}'),
  ('00000000-0000-0000-0000-0000000000a2', 'user2@book.com', '{"firstName": "Second", "lastName": "Best"}'),
  ('00000000-0000-0000-0000-0000000000a0', 'testadmin@book.com', '{"firstName": "Super", "lastName": "Admin"}');

update public.user
set permission_level = 'super_admin'
where id = '00000000-0000-0000-0000-0000000000a0';

-- ### User RLS Tests ###

-- TEST 1: Authenticated user can read their own user data
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select results_eq(
  $$select id, first_name, last_name, email from public.user where id = auth.uid()$$,
  $$VALUES ('00000000-0000-0000-0000-0000000000a1'::uuid, 'Greatest', 'Ever', 'user1@book.com')$$,
  'Authenticated user can read their own user data'
);

-- TEST 2: Authenticated user cannot read another user's data
select results_eq(
  $$select count(*) from public.user where id = '00000000-0000-0000-0000-0000000000a2'$$,
  ARRAY[0::bigint],
  'Authenticated user cannot read another user'
);

-- TEST 3: Super-admin can read any user data
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a0';
select results_eq(
  $$select id, first_name, last_name, email from public.user where id = '00000000-0000-0000-0000-0000000000a2'$$,
  $$VALUES ('00000000-0000-0000-0000-0000000000a2'::uuid, 'Second', 'Best', 'user2@book.com')$$,
  'Super admin can read any user data'
);

-- TEST 4: Authenticated user can update their own user data
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

-- Test that user can update their own row
select lives_ok(
  $$update public.user set first_name = 'Updated' where id = auth.uid()$$,
  'Authenticated user can update their own user data'
);

-- Verify the update was successful
select results_eq(
  $$select first_name from public.user where id = auth.uid()$$,
  ARRAY['Updated'::text],
  'User update was successful'
);

-- TEST 4b: Authenticated user cannot update their permission level
select throws_ok(
  $$update public.user set permission_level = 'admin' where id = auth.uid()$$,
  'You are not allowed to change your permission level.',
  'User cannot update their own permission level'
);

-- TEST 5: Authenticated user cannot update another user's data
-- First, let's verify the user can't see the other user's row
select results_eq(
  $$select count(*) from public.user where id = '00000000-0000-0000-0000-0000000000a2'$$,
  ARRAY[0::bigint],
  'User cannot see another user row due to SELECT policy'
);

reset role;

-- Now test that UPDATE affects 0 rows due to RLS
-- We'll use a function to capture the row count
CREATE OR REPLACE FUNCTION test_update_other_user()
RETURNS integer AS $$
DECLARE
  affected_rows integer;
BEGIN
  UPDATE public.user SET first_name = 'Hacked' WHERE id = '00000000-0000-0000-0000-0000000000a2';
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

grant execute on function test_update_other_user to authenticated;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

-- Test that the function returns 0 (no rows affected)
select results_eq(
  $$SELECT test_update_other_user()$$,
  ARRAY[0::integer],
  'Authenticated user cannot update another user data (affects 0 rows)'
);

-- Clean up the test function
reset role;
DROP FUNCTION test_update_other_user();

-- TEST 6: Super-admin can update any user data
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a0';

-- Test that super-admin can update any user row
select lives_ok(
  $$update public.user set first_name = 'Admin Updated' where id = '00000000-0000-0000-0000-0000000000a2'$$,
  'Super admin can update any user data'
);

-- Verify the update was successful
select results_eq(
  $$select first_name from public.user where id = '00000000-0000-0000-0000-0000000000a2'$$,
  ARRAY['Admin Updated'::text],
  'Super admin update was successful'
);

SELECT * FROM finish();
ROLLBACK;
