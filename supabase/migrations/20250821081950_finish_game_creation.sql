drop function if exists "public"."create_tournament_for_team"(team_id uuid, tournament_name text, region_id uuid, start_date date, end_date date, location_id uuid, location_city text, location_state text);

drop function if exists "public"."create_tournament_game_for_team"(game_name text, tournament_id uuid, creator_team_id uuid, creator_team_role team_role, opponent_team_id uuid, scheduled_start_time timestamp with time zone, location_id uuid, field_name text);

alter table "public"."region" add column "time_zone" text not null default 'America/Los_Angeles'::text;

alter table "public"."tournament" add column "tournament_data" jsonb not null default '{}'::jsonb;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_tournament_for_team(team_id uuid, tournament_name text, association text, region_id uuid, start_date date, end_date date, location_id uuid DEFAULT NULL::uuid, location_city text DEFAULT NULL::text, location_state text DEFAULT NULL::text, tournament_data jsonb DEFAULT '{}'::jsonb)
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
    association,
    region_id,
    start_date,
    end_date,
    location_id,
    location_city,
    location_state,
    tournament_data
  ) VALUES (
    tournament_name,
    association,
    region_id,
    start_date,
    end_date,
    location_id,
    location_city,
    location_state,
    tournament_data
  ) RETURNING * INTO new_tournament;

  -- Link the team to the tournament
  INSERT INTO public.tournament_team (tournament_id, team_id)
  VALUES (new_tournament.id, team_id);

  RETURN new_tournament;
END;$function$
;

CREATE OR REPLACE FUNCTION public.create_tournament_game_for_team(game_name text, tournament_id uuid, creator_team_id uuid, creator_team_role team_role, opponent_team_id uuid, scheduled_start_time timestamp with time zone, location_id uuid DEFAULT NULL::uuid, field_name text DEFAULT NULL::text, game_data jsonb DEFAULT '{}'::jsonb)
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
    field,
    game_data
  )
  VALUES (
    game_name,
    tournament_id,
    creator_team_id,
    auth.uid(),
    scheduled_start_time,
    location_id,
    field_name,
    game_data
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

CREATE OR REPLACE FUNCTION public.is_valid_game_time_for_tournament(tournament_id uuid, scheduled_start timestamp with time zone, grace_interval interval DEFAULT '02:00:00'::interval)
 RETURNS boolean
 LANGUAGE sql
AS $function$
  SELECT scheduled_start >= (t.start_date::timestamp AT TIME ZONE r.time_zone)
     AND scheduled_start <= ((t.end_date::timestamp + interval '1 day')::timestamp 
                              AT TIME ZONE r.time_zone
                              + grace_interval)
  FROM public.tournament t
  JOIN public.region r ON r.id = t.region_id
  WHERE t.id = tournament_id;
$function$
;


