BEGIN;

create extension if not exists pgtap with schema extensions;

SELECT plan(7);

-- Create test users
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'user1@book.com', '{"firstName": "Greatest", "lastName": "Ever"}'),
  ('00000000-0000-0000-0000-0000000000a2', 'user2@book.com', '{"firstName": "Second", "lastName": "Best"}'),
  ('00000000-0000-0000-0000-0000000000a0', 'testadmin@book.com', '{"firstName": "Super", "lastName": "Admin"}');

-- Set up super admin user
update public.user
set permission_level = 'super_admin'
where id = '00000000-0000-0000-0000-0000000000a0';

-- Create test teams
insert into public.team (id, name) values
  ('00000000-0000-0000-0000-0000000000b1', 'Team 1'),
  ('00000000-0000-0000-0000-0000000000b2', 'Team 2');

-- Create test locations
insert into public.location (id, name, city, state, address, created_by_team_id) values
  ('00000000-0000-0000-0000-0000000000c1', 'Central Park', 'New York', 'NY', '123 Central Park West', '00000000-0000-0000-0000-0000000000b1'),
  ('00000000-0000-0000-0000-0000000000c2', 'Fenway Park', 'Boston', 'MA', '4 Yawkey Way', '00000000-0000-0000-0000-0000000000b2');

-- ### Location Tests ###

-- TEST 1: Super admin can view all locations
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a0';

select results_eq(
  $$select count(*) from public.location$$,
  $$values (2::bigint)$$,
  'Super admin can view all locations'
);

-- TEST 2: Super admin can create locations
select lives_ok(
  $$insert into public.location (name, city, state, address, created_by_team_id) 
    values ('Wrigley Field', 'Chicago', 'IL', '1060 W Addison St', '00000000-0000-0000-0000-0000000000b1')$$,
  'Super admin can create locations'
);

-- TEST 3: Team scorekeeper can create locations for their team
reset role;
-- Add user 1 to team 1 as scorekeeper
insert into public.user_team (user_id, team_id, permission_level) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1', 'scorekeeper');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select lives_ok(
  $$insert into public.location (name, city, state, address, created_by_team_id) 
    values ('Yankee Stadium', 'New York', 'NY', '1 E 161st St', '00000000-0000-0000-0000-0000000000b1')$$,
  'Team scorekeeper can create locations for their team'
);

-- TEST 4: Team scorekeeper cannot create locations for other teams
select throws_ok(
  $$insert into public.location (name, city, state, address, created_by_team_id) 
    values ('Dodger Stadium', 'Los Angeles', 'CA', '1000 Vin Scully Ave', '00000000-0000-0000-0000-0000000000b2')$$,
  'new row violates row-level security policy for table "location"',
  'Team scorekeeper cannot create locations for other teams'
);

-- TEST 5: Team member can view locations created by their team
reset role;
-- Add user 1 to team 1 as member (downgrade from scorekeeper)
update public.user_team set permission_level = 'member'
  where user_id = '00000000-0000-0000-0000-0000000000a1'
  and team_id = '00000000-0000-0000-0000-0000000000b1';

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select results_eq(
  $$select count(*) from public.location where created_by_team_id = '00000000-0000-0000-0000-0000000000b1'$$,
  $$values (3::bigint)$$,
  'Team member can view locations created by their team'
);

-- TEST 6: Team member cannot create locations
select throws_ok(
  $$insert into public.location (name, city, state, address, created_by_team_id) 
    values ('Petco Park', 'San Diego', 'CA', '100 Park Blvd', '00000000-0000-0000-0000-0000000000b1')$$,
  'new row violates row-level security policy for table "location"',
  'Team member cannot create locations'
);

-- TEST 7: User cannot view locations from teams they don't have access to
reset role;
-- Add user 2 to team 2 as member
insert into public.user_team (user_id, team_id, permission_level) values
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000b2', 'member');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a2';

select results_eq(
  $$select count(*) from public.location where created_by_team_id = '00000000-0000-0000-0000-0000000000b1'$$,
  $$values (0::bigint)$$,
  'User cannot view locations from teams they do not have access to'
);

SELECT * FROM finish();
ROLLBACK;
