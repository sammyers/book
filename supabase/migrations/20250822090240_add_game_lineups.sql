drop policy "Team members can view associated teams" on "public"."team";

drop policy "Users can view their teams" on "public"."team";

drop policy "Team members can view data for games their team owns" on "public"."game_action";

alter table "public"."game_action" drop constraint "game_action_game_id_fkey";

alter table "public"."player_team" drop constraint "player_team_player_id_fkey";

alter table "public"."player_team" drop constraint "player_team_team_id_fkey";

alter table "public"."tournament_team" drop constraint "tournament_team_team_id_fkey";

alter table "public"."tournament_team" drop constraint "tournament_team_tournament_id_fkey";

alter table "public"."user_team" drop constraint "user_team_team_id_fkey";

alter table "public"."user_team" drop constraint "user_team_user_id_fkey";

drop function if exists "public"."create_game"(game_name text, teams new_game_team[]);

alter table "public"."game" alter column "status" drop default;

alter type "public"."game_status" rename to "game_status__old_version_to_be_dropped";

create type "public"."game_status" as enum ('completed', 'in_progress', 'not_started', 'canceled');

create table "public"."game_roster_player" (
    "game_id" uuid not null,
    "team_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "player_id" uuid not null
);


alter table "public"."game_roster_player" enable row level security;

create table "public"."lineup" (
    "game_id" uuid not null,
    "team_id" uuid not null,
    "lineup_data" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."lineup" enable row level security;

alter table "public"."game" alter column status type "public"."game_status" using status::text::"public"."game_status";

alter table "public"."game" alter column "status" set default 'not_started'::game_status;

drop type "public"."game_status__old_version_to_be_dropped";

CREATE UNIQUE INDEX game_roster_player_pkey ON public.game_roster_player USING btree (game_id, team_id, player_id);

CREATE UNIQUE INDEX lineup_pkey ON public.lineup USING btree (game_id, team_id);

alter table "public"."game_roster_player" add constraint "game_roster_player_pkey" PRIMARY KEY using index "game_roster_player_pkey";

alter table "public"."lineup" add constraint "lineup_pkey" PRIMARY KEY using index "lineup_pkey";

alter table "public"."game_roster_player" add constraint "game_roster_player_game_id_fkey" FOREIGN KEY (game_id) REFERENCES game(id) ON DELETE CASCADE not valid;

alter table "public"."game_roster_player" validate constraint "game_roster_player_game_id_fkey";

alter table "public"."game_roster_player" add constraint "game_roster_player_player_id_fkey" FOREIGN KEY (player_id) REFERENCES player(id) ON DELETE CASCADE not valid;

alter table "public"."game_roster_player" validate constraint "game_roster_player_player_id_fkey";

alter table "public"."game_roster_player" add constraint "game_roster_player_team_id_fkey" FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE not valid;

alter table "public"."game_roster_player" validate constraint "game_roster_player_team_id_fkey";

alter table "public"."lineup" add constraint "lineup_game_id_fkey" FOREIGN KEY (game_id) REFERENCES game(id) ON DELETE CASCADE not valid;

alter table "public"."lineup" validate constraint "lineup_game_id_fkey";

alter table "public"."lineup" add constraint "lineup_team_id_fkey" FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE not valid;

alter table "public"."lineup" validate constraint "lineup_team_id_fkey";

alter table "public"."game_action" add constraint "game_action_game_id_fkey" FOREIGN KEY (game_id) REFERENCES game(id) ON DELETE CASCADE not valid;

alter table "public"."game_action" validate constraint "game_action_game_id_fkey";

alter table "public"."player_team" add constraint "player_team_player_id_fkey" FOREIGN KEY (player_id) REFERENCES player(id) ON DELETE CASCADE not valid;

alter table "public"."player_team" validate constraint "player_team_player_id_fkey";

alter table "public"."player_team" add constraint "player_team_team_id_fkey" FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE not valid;

alter table "public"."player_team" validate constraint "player_team_team_id_fkey";

alter table "public"."tournament_team" add constraint "tournament_team_team_id_fkey" FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE not valid;

alter table "public"."tournament_team" validate constraint "tournament_team_team_id_fkey";

alter table "public"."tournament_team" add constraint "tournament_team_tournament_id_fkey" FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE not valid;

alter table "public"."tournament_team" validate constraint "tournament_team_tournament_id_fkey";

alter table "public"."user_team" add constraint "user_team_team_id_fkey" FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE not valid;

alter table "public"."user_team" validate constraint "user_team_team_id_fkey";

alter table "public"."user_team" add constraint "user_team_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE not valid;

alter table "public"."user_team" validate constraint "user_team_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_scorekeep_game(game_id uuid)
 RETURNS boolean
 LANGUAGE sql
AS $function$SELECT has_team_permission(
  (SELECT game.created_by_team_id FROM game WHERE game.id = game_id),
  'scorekeeper'
);$function$
;

CREATE OR REPLACE FUNCTION public.can_view_game(game_id uuid)
 RETURNS boolean
 LANGUAGE sql
AS $function$SELECT has_team_permission(
  (SELECT game.created_by_team_id FROM game WHERE game.id = game_id),
  'member'
);$function$
;

CREATE OR REPLACE FUNCTION public.has_team_permission(team_id uuid, permission team_permission_level)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  user_permission public.team_permission_level;
BEGIN
  SELECT MAX(ut.permission_level)  -- highest permission across team + associated team
  INTO user_permission
  FROM public.user_team ut
  JOIN public.team t
    ON ut.team_id IN (t.id, t.associated_team_id)
  WHERE t.id = has_team_permission.team_id
    AND ut.user_id = auth.uid();

  IF user_permission IS NULL THEN
    RETURN false;
  END IF;

  RETURN user_permission >= has_team_permission.permission;
END;
$function$
;

grant delete on table "public"."game_roster_player" to "anon";

grant insert on table "public"."game_roster_player" to "anon";

grant references on table "public"."game_roster_player" to "anon";

grant select on table "public"."game_roster_player" to "anon";

grant trigger on table "public"."game_roster_player" to "anon";

grant truncate on table "public"."game_roster_player" to "anon";

grant update on table "public"."game_roster_player" to "anon";

grant delete on table "public"."game_roster_player" to "authenticated";

grant insert on table "public"."game_roster_player" to "authenticated";

grant references on table "public"."game_roster_player" to "authenticated";

grant select on table "public"."game_roster_player" to "authenticated";

grant trigger on table "public"."game_roster_player" to "authenticated";

grant truncate on table "public"."game_roster_player" to "authenticated";

grant update on table "public"."game_roster_player" to "authenticated";

grant delete on table "public"."game_roster_player" to "service_role";

grant insert on table "public"."game_roster_player" to "service_role";

grant references on table "public"."game_roster_player" to "service_role";

grant select on table "public"."game_roster_player" to "service_role";

grant trigger on table "public"."game_roster_player" to "service_role";

grant truncate on table "public"."game_roster_player" to "service_role";

grant update on table "public"."game_roster_player" to "service_role";

grant delete on table "public"."lineup" to "anon";

grant insert on table "public"."lineup" to "anon";

grant references on table "public"."lineup" to "anon";

grant select on table "public"."lineup" to "anon";

grant trigger on table "public"."lineup" to "anon";

grant truncate on table "public"."lineup" to "anon";

grant update on table "public"."lineup" to "anon";

grant delete on table "public"."lineup" to "authenticated";

grant insert on table "public"."lineup" to "authenticated";

grant references on table "public"."lineup" to "authenticated";

grant select on table "public"."lineup" to "authenticated";

grant trigger on table "public"."lineup" to "authenticated";

grant truncate on table "public"."lineup" to "authenticated";

grant update on table "public"."lineup" to "authenticated";

grant delete on table "public"."lineup" to "service_role";

grant insert on table "public"."lineup" to "service_role";

grant references on table "public"."lineup" to "service_role";

grant select on table "public"."lineup" to "service_role";

grant trigger on table "public"."lineup" to "service_role";

grant truncate on table "public"."lineup" to "service_role";

grant update on table "public"."lineup" to "service_role";

create policy "Scorekeepers can update their team's games"
on "public"."game"
as permissive
for update
to authenticated
using (( SELECT has_team_permission(game.created_by_team_id, 'scorekeeper'::team_permission_level) AS has_team_permission))
with check (( SELECT has_team_permission(game.created_by_team_id, 'scorekeeper'::team_permission_level) AS has_team_permission));


create policy "Scorekeepers can record game actions"
on "public"."game_action"
as permissive
for insert
to authenticated
with check (( SELECT can_scorekeep_game(game_action.game_id) AS can_scorekeep_game));


create policy "Scorekeepers can delete players from their team's rosters"
on "public"."game_roster_player"
as permissive
for delete
to authenticated
using (( SELECT (has_team_permission(game_roster_player.team_id, 'scorekeeper'::team_permission_level) AND can_scorekeep_game(game_roster_player.game_id))));


create policy "Scorekeepers can edit rosters for their team"
on "public"."game_roster_player"
as permissive
for insert
to authenticated
with check (( SELECT (has_team_permission(game_roster_player.team_id, 'scorekeeper'::team_permission_level) AND can_scorekeep_game(game_roster_player.game_id))));


create policy "Super admins can view all game data"
on "public"."game_roster_player"
as permissive
for select
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Team members can view data for games their team owns"
on "public"."game_roster_player"
as permissive
for select
to authenticated
using (( SELECT can_view_game(game_roster_player.game_id) AS can_view_game));


create policy "Scorekeepers can create lineups for their team"
on "public"."lineup"
as permissive
for insert
to authenticated
with check (( SELECT (has_team_permission(lineup.team_id, 'scorekeeper'::team_permission_level) AND can_scorekeep_game(lineup.game_id))));


create policy "Scorekeepers can update lineups for their team"
on "public"."lineup"
as permissive
for update
to authenticated
using (( SELECT (has_team_permission(lineup.team_id, 'scorekeeper'::team_permission_level) AND can_scorekeep_game(lineup.game_id))))
with check (( SELECT (has_team_permission(lineup.team_id, 'scorekeeper'::team_permission_level) AND can_scorekeep_game(lineup.game_id))));


create policy "Super admins can view all data"
on "public"."lineup"
as permissive
for select
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


create policy "Users can view lineups for their team's games"
on "public"."lineup"
as permissive
for select
to authenticated
using (( SELECT can_view_game(lineup.game_id) AS can_view_game));


create policy "Users can view their teams and associated teams"
on "public"."team"
as permissive
for select
to authenticated
using (( SELECT has_team_permission(team.id, 'member'::team_permission_level) AS has_team_permission));


create policy "Team members can view data for games their team owns"
on "public"."game_action"
as permissive
for select
to authenticated
using (( SELECT can_view_game(game_action.game_id) AS can_view_game));



