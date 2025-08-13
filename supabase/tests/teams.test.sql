BEGIN;

create extension if not exists pgtap with schema extensions;

SELECT plan(7);

-- Create test users
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'user1@book.com', '{"firstName": "Greatest", "lastName": "Ever"}'),
  ('00000000-0000-0000-0000-0000000000a2', 'user2@book.com', '{"firstName": "Second", "lastName": "Best"}'),
  ('00000000-0000-0000-0000-0000000000a0', 'testadmin@book.com', '{"firstName": "Super", "lastName": "Admin"}');

update public.user
set permission_level = 'super_admin'
where id = '00000000-0000-0000-0000-0000000000a0';

-- Create test teams
insert into public.team (id, name) values
  ('00000000-0000-0000-0000-0000000000b1', 'Team 1'),
  ('00000000-0000-0000-0000-0000000000b2', 'Team 2');

-- Create test players
insert into public.player (id, name, primary_position) values
  ('00000000-0000-0000-0000-0000000000c1', 'Player 1', 'shortstop'),
  ('00000000-0000-0000-0000-0000000000c2', 'Player 2', 'center_field');

-- ### Team Tests ###

-- TEST 1: Super-admin can create teams
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a0';

select lives_ok(
  $$insert into public.team (name) values ('Super Team')$$,
  'Super-admin can create teams'
);

-- TEST 2: Non-super-admins cannot create teams
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select throws_ok(
  $$insert into public.team (name) values ('User Created Team')$$,
  'new row violates row-level security policy for table "team"',
  'Non-super-admin cannot create teams'
);

-- TEST 3: Super-admin can add user to a team
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a0';

select lives_ok(
  $$insert into public.user_team (user_id, team_id, permission_level)
    values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1', 'scorekeeper')$$,
  'Super-admin can add users to teams'
);

-- TEST 4: Non-scorekeeper cannot create associated teams
reset role;
-- Add user 2 to team 1 as member
insert into public.user_team (user_id, team_id, permission_level) values
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000b1', 'member');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a2';

select throws_ok(
  $$insert into public.team (name, associated_team_id) values ('Associated Team', '00000000-0000-0000-0000-0000000000b1')$$,
  'new row violates row-level security policy for table "team"',
  'Non-manager cannot create associated teams'
);

-- TEST 5: Scorekeeper can create associated teams
reset role;
-- Give user 2 'scorekeeper' permission on team 1
update public.user_team set permission_level = 'scorekeeper'
  where user_id = '00000000-0000-0000-0000-0000000000a2'
  and team_id = '00000000-0000-0000-0000-0000000000b1';

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a2';

select lives_ok(
  $$insert into public.team (name, associated_team_id) values ('Associated Team', '00000000-0000-0000-0000-0000000000b1')$$,
  'Scorekeeper can create associated teams'
);

-- TEST 6: Manager can add players to their team
reset role;
-- Add user 1 to team 2 as manager
insert into public.user_team (user_id, team_id, permission_level) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b2', 'manager');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select lives_ok(
  $$insert into public.player_team (player_id, team_id) values
    ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000b2'),
    ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000b2')
  $$,
  'Manager can add players to their team'
);

-- TEST 7: Non-manager cannot add players
reset role;
-- Add user 2 to team 2 as member
insert into public.user_team (user_id, team_id, permission_level) values
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000b2', 'member');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a2';

-- Attempt to add players to team 2 as a member
select throws_ok(
  $$insert into public.player_team (player_id, team_id) values
    ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000b2'),
    ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000b2')
  $$,
  'new row violates row-level security policy for table "player_team"',
  'Non-manager cannot add players'
);

SELECT * FROM finish();
ROLLBACK;
