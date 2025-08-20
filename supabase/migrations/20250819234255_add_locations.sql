drop policy "(temp) Enable insert for authenticated users only" on "public"."player";

drop function if exists "public"."create_tournament_for_team"(team_id uuid, tournament_name text, region_id uuid, start_date date, end_date date);

drop function if exists "public"."create_tournament_game_for_team"(game_name text, tournament_id uuid, creator_team_id uuid, creator_team_role team_role, opponent_team_id uuid, scheduled_start_time timestamp with time zone);

create table "public"."location" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "city" text not null,
    "state" text,
    "address" text,
    "created_by_team_id" uuid
);


alter table "public"."location" enable row level security;

alter table "public"."game" add column "field" text;

alter table "public"."game" add column "location_id" uuid not null;

alter table "public"."tournament" add column "association" text;

alter table "public"."tournament" add column "location_city" text;

alter table "public"."tournament" add column "location_id" uuid;

alter table "public"."tournament" add column "location_state" text;

CREATE UNIQUE INDEX location_pkey ON public.location USING btree (id);

alter table "public"."location" add constraint "location_pkey" PRIMARY KEY using index "location_pkey";

alter table "public"."game" add constraint "game_location_id_fkey" FOREIGN KEY (location_id) REFERENCES location(id) not valid;

alter table "public"."game" validate constraint "game_location_id_fkey";

alter table "public"."location" add constraint "location_created_by_team_id_fkey" FOREIGN KEY (created_by_team_id) REFERENCES team(id) not valid;

alter table "public"."location" validate constraint "location_created_by_team_id_fkey";

alter table "public"."tournament" add constraint "tournament_location_id_fkey" FOREIGN KEY (location_id) REFERENCES location(id) not valid;

alter table "public"."tournament" validate constraint "tournament_location_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_tournament_for_team(team_id uuid, tournament_name text, region_id uuid, start_date date, end_date date, location_id uuid DEFAULT NULL::uuid, location_city text DEFAULT NULL::text, location_state text DEFAULT NULL::text)
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

  IF location_id IS NULL AND location_city IS NULL THEN
    RAISE EXCEPTION 'Location id or city must be provided';
  END IF;

  IF location_id IS NOT NULL THEN
    location_city := NULL;
    location_state := NULL;
  END IF;
  
  -- Insert the new tournament
  INSERT INTO public.tournament (
    name,
    region_id,
    start_date,
    end_date,
    location_id,
    location_city,
    location_state
  ) VALUES (
    tournament_name,
    region_id,
    start_date,
    end_date,
    location_id,
    location_city,
    location_state
  ) RETURNING * INTO new_tournament;

  -- Link the team to the tournament
  INSERT INTO public.tournament_team (tournament_id, team_id)
  VALUES (new_tournament.id, team_id);

  RETURN new_tournament;
END;$function$
;

CREATE OR REPLACE FUNCTION public.create_tournament_game_for_team(game_name text, tournament_id uuid, creator_team_id uuid, creator_team_role team_role, opponent_team_id uuid, scheduled_start_time timestamp with time zone, location_id uuid DEFAULT NULL::uuid, field_name text DEFAULT NULL::text)
 RETURNS game
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$DECLARE
  new_game public.game%ROWTYPE;
  opponent_role public.team_role;
  tournament_location_id uuid;
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

  SELECT tournament.location_id FROM public.tournament INTO tournament_location_id WHERE tournament.id = tournament_id;
  IF tournament_location_id IS NULL AND location_id IS NULL THEN
    RAISE EXCEPTION 'Game location must be specified';
  END IF;

  IF tournament_location_id IS NOT NULL THEN
    IF location_id IS NOT NULL AND tournament_location_id != location_id THEN
      RAISE EXCEPTION 'Game location does not match tournament location';

    END IF;

    location_id := tournament_location_id;
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
    scheduled_start_time,
    location_id,
    field
  )
  VALUES (
    game_name,
    tournament_id,
    creator_team_id,
    auth.uid(),
    scheduled_start_time,
    location_id,
    field_name
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

CREATE OR REPLACE FUNCTION public.has_permission_for_any_team(min_level team_permission_level)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM user_team ut
    WHERE ut.user_id = auth.uid()
      AND ut.permission_level >= min_level
  );
$function$
;

grant delete on table "public"."location" to "anon";

grant insert on table "public"."location" to "anon";

grant references on table "public"."location" to "anon";

grant select on table "public"."location" to "anon";

grant trigger on table "public"."location" to "anon";

grant truncate on table "public"."location" to "anon";

grant update on table "public"."location" to "anon";

grant delete on table "public"."location" to "authenticated";

grant insert on table "public"."location" to "authenticated";

grant references on table "public"."location" to "authenticated";

grant select on table "public"."location" to "authenticated";

grant trigger on table "public"."location" to "authenticated";

grant truncate on table "public"."location" to "authenticated";

grant update on table "public"."location" to "authenticated";

grant delete on table "public"."location" to "service_role";

grant insert on table "public"."location" to "service_role";

grant references on table "public"."location" to "service_role";

grant select on table "public"."location" to "service_role";

grant trigger on table "public"."location" to "service_role";

grant truncate on table "public"."location" to "service_role";

grant update on table "public"."location" to "service_role";

create policy "Super admins can create locations"
on "public"."location"
as permissive
for insert
to authenticated
with check (( SELECT is_super_admin() AS is_super_admin));


create policy "Super admins can update locations"
on "public"."location"
as permissive
for update
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Super admins can view all locations"
on "public"."location"
as permissive
for select
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Team scorekeepers can create locations"
on "public"."location"
as permissive
for insert
to authenticated
with check (( SELECT has_team_permission(location.created_by_team_id, 'scorekeeper'::team_permission_level) AS has_team_permission));


create policy "Users can view locations created by their team"
on "public"."location"
as permissive
for select
to authenticated
using (( SELECT has_team_permission(location.created_by_team_id, 'member'::team_permission_level) AS has_team_permission));


create policy "Authenticated users can view all players"
on "public"."player"
as permissive
for select
to authenticated
using (true);


create policy "Team managers can create players"
on "public"."player"
as permissive
for insert
to authenticated
with check (( SELECT has_permission_for_any_team('manager'::team_permission_level) AS has_permission_for_any_team));


create policy "Team managers can view all team memberships"
on "public"."player_team"
as permissive
for select
to authenticated
using (( SELECT has_permission_for_any_team('manager'::team_permission_level) AS has_permission_for_any_team));


create policy "Team managers can view all teams"
on "public"."team"
as permissive
for select
to authenticated
using (( SELECT has_permission_for_any_team('manager'::team_permission_level) AS has_permission_for_any_team));



