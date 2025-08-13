drop policy "(temp) Enable update for authenticated users only" on "public"."game";

drop policy "Enable insert for authenticated users only" on "public"."game";

drop policy "Enable read access for all users" on "public"."game";

drop policy "Enable insert for authenticated users only" on "public"."game_team";

drop policy "Enable read access for all users" on "public"."game_team";

drop policy "Enable insert for authenticated users only" on "public"."player";

drop policy "Enable read access for all users" on "public"."player";

drop policy "Enable insert for users based on user permission" on "public"."player_team";

drop policy "Enable read access for authenticated users" on "public"."player_team";

drop policy "Enable read access for all users" on "public"."region";

drop policy "Enable insert for users based on user permission" on "public"."team";

drop policy "Enable read access for all users" on "public"."team";

drop policy "Enable read access for all users" on "public"."tournament";

drop policy "Enable read access for all users" on "public"."tournament_team";

drop policy "Enable users to view their own data only" on "public"."user";

drop policy "Enable insert for users based on user permission" on "public"."user_team";

drop policy "Enable users to view their own data only" on "public"."user_team";

alter table "public"."game" add column "created_by_team_id" uuid;

alter table "public"."game" add column "created_by_user_id" uuid not null;

alter table "public"."game" add constraint "game_created_by_team_id_fkey" FOREIGN KEY (created_by_team_id) REFERENCES team(id) not valid;

alter table "public"."game" validate constraint "game_created_by_team_id_fkey";

alter table "public"."game" add constraint "game_created_by_user_id_fkey" FOREIGN KEY (created_by_user_id) REFERENCES "user"(id) not valid;

alter table "public"."game" validate constraint "game_created_by_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_tournament_game_for_team(game_name text, tournament_id uuid, creator_team_id uuid, creator_team_role team_role, opponent_team_id uuid, scheduled_start_time timestamp with time zone)
 RETURNS game
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$DECLARE
  new_game public.game%ROWTYPE;
  opponent_role public.team_role;
BEGIN
  -- Permission check
  IF NOT public.has_team_permission(creator_team_id, 'scorekeeper') THEN
    RAISE EXCEPTION 'Permission denied: must be scorekeeper or higher for the creator team'
      USING ERRCODE = '42501';
  END IF;

  -- Validate teams are not the same
  IF creator_team_id = opponent_team_id THEN
    RAISE EXCEPTION 'Opponent team cannot be the same as creator team';
  END IF;

  -- Validate opponent team is associated with creator team
  IF NOT EXISTS (
    SELECT 1
    FROM public.team t
    WHERE t.id = opponent_team_id
      AND t.associated_team_id = creator_team_id
  ) THEN
    RAISE EXCEPTION
      'Opponent team must have creator team as its associated_team_id';
  END IF;

  -- Validate creator team is in the tournament
  IF NOT EXISTS (
    SELECT 1 FROM public.tournament_team
    WHERE team_id = creator_team_id AND tournament_team.tournament_id = create_tournament_game_for_team.tournament_id
  ) THEN
    RAISE EXCEPTION
      'Creator team must be entered in the tournament';
  END IF;

  -- Validate game time
  IF NOT public.is_valid_game_time_for_tournament(tournament_id, scheduled_start_time) THEN
    RAISE EXCEPTION
      'Scheduled start time must fall within tournament dates';
  END IF;

  -- Determine opponent's role
  opponent_role := public.opposite_team_role(creator_team_role);

  -- Ensure opponent team is entered in the tournament if not already
  INSERT INTO public.tournament_team (team_id, tournament_id)
  SELECT opponent_team_id, tournament_id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.tournament_team
    WHERE team_id = opponent_team_id AND tournament_team.tournament_id = create_tournament_game_for_team.tournament_id
  );

  -- Insert the game
  INSERT INTO public.game (
    name,
    tournament_id,
    created_by_team_id,
    created_by_user_id,
    scheduled_start_time
  )
  VALUES (
    game_name,
    tournament_id,
    creator_team_id,
    auth.uid(),
    scheduled_start_time
  )
  RETURNING * INTO new_game;

  -- Insert both teams into game_team
  INSERT INTO public.game_team (game_id, team_id, role)
  VALUES
    (new_game.id, creator_team_id, creator_team_role),
    (new_game.id, opponent_team_id, opponent_role);

  RETURN new_game;
END;$function$
;

CREATE OR REPLACE FUNCTION public.has_team_permission(team_id uuid, permission team_permission_level)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
AS $function$declare
  user_permission public.team_permission_level;
begin
  select permission_level into user_permission
  from public.user_team
  where user_team.team_id = has_team_permission.team_id
  and user_id = auth.uid();

  if user_permission is null then
    return false;
  end if;

  return user_permission >= permission;
end;$function$
;

CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  user_permission user_permission_level;
BEGIN
  SELECT permission_level INTO user_permission
  FROM "user" WHERE id = auth.uid();

  RETURN user_permission = 'super_admin'::user_permission_level;
END;$function$
;

CREATE OR REPLACE FUNCTION public.is_valid_game_time_for_tournament(tournament_id uuid, scheduled_start timestamp with time zone, grace_interval interval DEFAULT '02:00:00'::interval)
 RETURNS boolean
 LANGUAGE sql
AS $function$
  SELECT scheduled_start >= t.start_date::timestamp
     AND scheduled_start <= (t.end_date::timestamp + grace_interval)
  FROM public.tournament t
  WHERE t.id = tournament_id
$function$
;

CREATE OR REPLACE FUNCTION public.opposite_team_role(role team_role)
 RETURNS team_role
 LANGUAGE sql
AS $function$
  SELECT CASE role
    WHEN 'home' THEN 'away'::public.team_role
    ELSE 'home'::public.team_role
  END
$function$
;

CREATE OR REPLACE FUNCTION public.create_tournament_for_team(team_id uuid, tournament_name text, region_id uuid, start_date date, end_date date)
 RETURNS tournament
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$#variable_conflict use_variable
DECLARE
  new_tournament public.tournament%ROWTYPE;
BEGIN
  IF NOT public.has_team_permission(team_id, 'manager') THEN
    RAISE EXCEPTION 'Permission denied for team %', team_id
      USING ERRCODE = '42501'; -- insufficient privilege
  END IF;
  
  -- Insert the new tournament
  INSERT INTO public.tournament (name, region_id, start_date, end_date)
  VALUES (tournament_name, region_id, start_date, end_date)
  RETURNING * INTO new_tournament;

  -- Link the team to the tournament
  INSERT INTO public.tournament_team (tournament_id, team_id)
  VALUES (new_tournament.id, team_id);

  RETURN new_tournament;
END;$function$
;

CREATE OR REPLACE FUNCTION public.is_user_super_admin(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$DECLARE
  user_permission user_permission_level;
BEGIN
  SELECT permission_level INTO user_permission
  FROM "user" WHERE id = target_user_id;

  RETURN user_permission = 'super_admin'::user_permission_level;
END;$function$
;

create policy "Super admins can view all games"
on "public"."game"
as permissive
for select
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Team members can view games their team owns"
on "public"."game"
as permissive
for select
to authenticated
using (( SELECT has_team_permission(game.created_by_team_id, 'member'::team_permission_level) AS has_team_permission));


create policy "Super admins can view all game data"
on "public"."game_action"
as permissive
for select
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Team members can view data for games their team owns"
on "public"."game_action"
as permissive
for select
to authenticated
using (( SELECT has_team_permission(( SELECT game.created_by_team_id
           FROM game
          WHERE (game.id = game_action.game_id)), 'member'::team_permission_level) AS has_team_permission));


create policy "Super admins can view all data"
on "public"."game_team"
as permissive
for select
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Team members can view teams in their games"
on "public"."game_team"
as permissive
for select
to authenticated
using (( SELECT has_team_permission(( SELECT game.created_by_team_id
           FROM game
          WHERE (game.id = game_team.game_id)), 'member'::team_permission_level) AS has_team_permission));


create policy "(temp) Enable insert for authenticated users only"
on "public"."player"
as permissive
for insert
to authenticated
with check (true);


create policy "Super admins can view all players"
on "public"."player"
as permissive
for select
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Super admins can view all data"
on "public"."player_team"
as permissive
for select
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Team managers can add players to their team"
on "public"."player_team"
as permissive
for insert
to authenticated
with check (( SELECT has_team_permission(player_team.team_id, 'manager'::team_permission_level) AS has_team_permission));


create policy "Team members can view their team's players"
on "public"."player_team"
as permissive
for select
to authenticated
using (( SELECT has_team_permission(player_team.team_id, 'member'::team_permission_level) AS has_team_permission));


create policy "All users can view regions"
on "public"."region"
as permissive
for select
to authenticated
using (true);


create policy "Super admins can add teams"
on "public"."team"
as permissive
for insert
to authenticated
with check (( SELECT is_super_admin() AS is_super_admin));


create policy "Super admins can view all teams"
on "public"."team"
as permissive
for select
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Team members can view associated teams"
on "public"."team"
as permissive
for select
to authenticated
using (( SELECT has_team_permission(team.associated_team_id, 'member'::team_permission_level) AS has_team_permission));


create policy "Team scorekeepers can create associated teams"
on "public"."team"
as permissive
for insert
to authenticated
with check (( SELECT has_team_permission(team.associated_team_id, 'scorekeeper'::team_permission_level) AS has_team_permission));


create policy "Users can view their teams"
on "public"."team"
as permissive
for select
to authenticated
using (( SELECT has_team_permission(team.id, 'member'::team_permission_level) AS has_team_permission));


create policy "Super admins can view all tournaments"
on "public"."tournament"
as permissive
for select
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Users can view their team's tournaments"
on "public"."tournament"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM tournament_team tt
  WHERE ((tt.tournament_id = tournament.id) AND has_team_permission(tt.team_id, 'member'::team_permission_level)))));


create policy "Super admins can view all data"
on "public"."tournament_team"
as permissive
for select
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Team members can view associated teams' tournaments"
on "public"."tournament_team"
as permissive
for select
to authenticated
using (( SELECT has_team_permission(( SELECT team.associated_team_id
           FROM team
          WHERE (team.id = tournament_team.team_id)), 'member'::team_permission_level) AS has_team_permission));


create policy "Team members can view their tournaments"
on "public"."tournament_team"
as permissive
for select
to authenticated
using (( SELECT has_team_permission(tournament_team.team_id, 'member'::team_permission_level) AS has_team_permission));


create policy "Super admins can view all users"
on "public"."user"
as permissive
for select
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Users can view their own data only"
on "public"."user"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Super admins can add users to teams"
on "public"."user_team"
as permissive
for insert
to authenticated
with check (( SELECT is_super_admin() AS is_super_admin));


create policy "Super admins can view all data"
on "public"."user_team"
as permissive
for select
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Users can view what teams they are a member of"
on "public"."user_team"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



