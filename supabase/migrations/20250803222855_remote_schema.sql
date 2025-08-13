

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."fielding_position" AS ENUM (
    'pitcher',
    'catcher',
    'first_base',
    'second_base',
    'third_base',
    'shortstop',
    'left_field',
    'center_field',
    'right_field',
    'left_center_field',
    'right_center_field',
    'middle_infield',
    'extra_hitter'
);


ALTER TYPE "public"."fielding_position" OWNER TO "postgres";


CREATE TYPE "public"."game_action_type" AS ENUM (
    'start_game',
    'single',
    'double',
    'triple',
    'home_run',
    'walk',
    'intentional_walk',
    'automatic_walk',
    'strikeout',
    'groundout',
    'flyout',
    'lineout',
    'sacrifice',
    'fielders_choice',
    'double_play',
    'triple_play',
    'stolen_base',
    'caught_stealing',
    'error',
    'dead_ball_out',
    'pinch_runner',
    'substitution',
    'defensive_switch',
    'batting_order_change',
    'skip_at_bat',
    'solo_mode_opponent_inning',
    'manual_override',
    'end_game'
);


ALTER TYPE "public"."game_action_type" OWNER TO "postgres";


CREATE TYPE "public"."game_status" AS ENUM (
    'completed',
    'in_progress',
    'not_started'
);


ALTER TYPE "public"."game_status" OWNER TO "postgres";


CREATE TYPE "public"."team_role" AS ENUM (
    'home',
    'away'
);


ALTER TYPE "public"."team_role" OWNER TO "postgres";


CREATE TYPE "public"."new_game_team" AS (
	"team_id" "uuid",
	"role" "public"."team_role"
);


ALTER TYPE "public"."new_game_team" OWNER TO "postgres";


CREATE TYPE "public"."team_permission_level" AS ENUM (
    'member',
    'scorekeeper',
    'manager'
);


ALTER TYPE "public"."team_permission_level" OWNER TO "postgres";


CREATE TYPE "public"."user_permission_level" AS ENUM (
    'user',
    'admin',
    'super_admin'
);


ALTER TYPE "public"."user_permission_level" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."game" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "status" "public"."game_status" DEFAULT 'not_started'::"public"."game_status" NOT NULL,
    "game_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "scheduled_start_time" timestamp with time zone,
    "started_at" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "tournament_id" "uuid"
);


ALTER TABLE "public"."game" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_game"("game_name" "text", "teams" "public"."new_game_team"[]) RETURNS "public"."game"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  new_game game%ROWTYPE;
BEGIN
  -- Insert a new game and return the created row
  INSERT INTO game (name)
  VALUES (game_name)
  RETURNING * INTO new_game;

  -- Insert the team data into game_team
  INSERT INTO game_team (game_id, team_id, role)
  SELECT new_game.id, team_data.team_id, team_data.role
  FROM UNNEST(teams) AS team_data;

  -- Return the created game
  RETURN new_game;
END;
$$;


ALTER FUNCTION "public"."create_game"("game_name" "text", "teams" "public"."new_game_team"[]) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "associated_team_id" "uuid"
);


ALTER TABLE "public"."team" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_team_with_players"("team_name" "text", "player_ids" "uuid"[]) RETURNS "public"."team"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    new_team team%ROWTYPE;
BEGIN
    -- Insert a new record in the 'teams' table
    INSERT INTO team (name)
    VALUES (team_name)
    RETURNING * INTO new_team;

    INSERT INTO user_team (user_id, team_id)
    VALUES (auth.uid(), new_team.id);

    -- Insert records into the 'player_team' table for each player
    IF player_ids IS NOT NULL THEN
        INSERT INTO player_team (team_id, player_id)
        SELECT new_team.id, unnest(player_ids);
    END IF;

    RETURN new_team;
END;$$;


ALTER FUNCTION "public"."create_team_with_players"("team_name" "text", "player_ids" "uuid"[]) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tournament" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "region_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL
);


ALTER TABLE "public"."tournament" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_tournament_for_team"("team_id" "uuid", "tournament_name" "text", "region_id" "uuid", "start_date" "date", "end_date" "date") RETURNS "public"."tournament"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
DECLARE
  new_tournament tournament%ROWTYPE;
BEGIN
  -- Insert the new tournament
  INSERT INTO tournament (name, region_id, start_date, end_date)
  VALUES (tournament_name, region_id, start_date, end_date)
  RETURNING * INTO new_tournament;

  -- Link the team to the tournament
  INSERT INTO tournament_team (tournament_id, team_id)
  VALUES (new_tournament.id, team_id);

  -- Return the ID of the newly created tournament
  RETURN new_tournament;
END;
$$;


ALTER FUNCTION "public"."create_tournament_for_team"("team_id" "uuid", "tournament_name" "text", "region_id" "uuid", "start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_team"("target_team_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$BEGIN
DELETE FROM player_team where team_id = target_team_id;
DELETE FROM user_team where team_id = target_team_id;
DELETE FROM team where id = target_team_id;
END;$$;


ALTER FUNCTION "public"."delete_team"("target_team_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$begin
  insert into public.user (id, email, first_name, last_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'firstName', new.raw_user_meta_data ->> 'lastName');
  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_admin"("target_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$DECLARE
  user_permission user_permission_level;
BEGIN
  SELECT permission_level INTO user_permission
  FROM "user" WHERE id = target_user_id;

  IF user_permission = 'admin'::user_permission_level THEN 
    RETURN TRUE;
  ELSIF user_permission = 'super_admin'::user_permission_level THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;$$;


ALTER FUNCTION "public"."is_user_admin"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_super_admin"("target_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$DECLARE
  user_permission user_permission_level;
BEGIN
  SELECT permission_level INTO user_permission
  FROM "user" WHERE id = target_user_id;

  IF user_permission = 'super_admin'::user_permission_level THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;$$;


ALTER FUNCTION "public"."is_user_super_admin"("target_user_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_action" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "game_id" "uuid" NOT NULL,
    "action_type" "public"."game_action_type" NOT NULL,
    "index" bigint NOT NULL,
    "action_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "previous_action_id" "uuid"
);


ALTER TABLE "public"."game_action" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_team" (
    "game_id" "uuid" NOT NULL,
    "team_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role" "public"."team_role" NOT NULL
);


ALTER TABLE "public"."game_team" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."player" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "primary_position" "public"."fielding_position" DEFAULT 'extra_hitter'::"public"."fielding_position" NOT NULL,
    "secondary_position" "public"."fielding_position",
    "jersey_number" "text",
    "nickname" "text"
);


ALTER TABLE "public"."player" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."player_team" (
    "player_id" "uuid" NOT NULL,
    "team_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."player_team" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."region" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "short_name" "text"
);


ALTER TABLE "public"."region" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tournament_team" (
    "tournament_id" "uuid" NOT NULL,
    "team_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tournament_team" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user" (
    "id" "uuid" NOT NULL,
    "first_name" "text" DEFAULT ''::"text" NOT NULL,
    "last_name" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "permission_level" "public"."user_permission_level" DEFAULT 'user'::"public"."user_permission_level" NOT NULL,
    "email" "text" DEFAULT ''::"text" NOT NULL
);


ALTER TABLE "public"."user" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_team" (
    "user_id" "uuid" NOT NULL,
    "team_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "permission_level" "public"."team_permission_level" DEFAULT 'member'::"public"."team_permission_level" NOT NULL
);


ALTER TABLE "public"."user_team" OWNER TO "postgres";


ALTER TABLE ONLY "public"."game_action"
    ADD CONSTRAINT "game_action_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."game_action"
    ADD CONSTRAINT "game_action_previous_action_id_key" UNIQUE ("previous_action_id");



ALTER TABLE ONLY "public"."game"
    ADD CONSTRAINT "game_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."game"
    ADD CONSTRAINT "game_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."game_team"
    ADD CONSTRAINT "game_team_pkey" PRIMARY KEY ("game_id", "team_id");



ALTER TABLE ONLY "public"."player"
    ADD CONSTRAINT "player_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."player_team"
    ADD CONSTRAINT "player_team_pkey" PRIMARY KEY ("player_id", "team_id");



ALTER TABLE ONLY "public"."region"
    ADD CONSTRAINT "region_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."region"
    ADD CONSTRAINT "region_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."region"
    ADD CONSTRAINT "region_short_name_key" UNIQUE ("short_name");



ALTER TABLE ONLY "public"."team"
    ADD CONSTRAINT "team_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tournament"
    ADD CONSTRAINT "tournament_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tournament_team"
    ADD CONSTRAINT "tournament_team_pkey" PRIMARY KEY ("tournament_id", "team_id");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_team"
    ADD CONSTRAINT "user_team_pkey" PRIMARY KEY ("user_id", "team_id");



ALTER TABLE ONLY "public"."game_action"
    ADD CONSTRAINT "game_action_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id");



ALTER TABLE ONLY "public"."game_action"
    ADD CONSTRAINT "game_action_previous_action_id_fkey" FOREIGN KEY ("previous_action_id") REFERENCES "public"."game_action"("id");



ALTER TABLE ONLY "public"."game_team"
    ADD CONSTRAINT "game_team_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id");



ALTER TABLE ONLY "public"."game_team"
    ADD CONSTRAINT "game_team_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id");



ALTER TABLE ONLY "public"."game"
    ADD CONSTRAINT "game_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id");



ALTER TABLE ONLY "public"."player_team"
    ADD CONSTRAINT "player_team_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id");



ALTER TABLE ONLY "public"."player_team"
    ADD CONSTRAINT "player_team_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id");



ALTER TABLE ONLY "public"."team"
    ADD CONSTRAINT "team_associated_team_id_fkey" FOREIGN KEY ("associated_team_id") REFERENCES "public"."team"("id");



ALTER TABLE ONLY "public"."tournament"
    ADD CONSTRAINT "tournament_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."region"("id");



ALTER TABLE ONLY "public"."tournament_team"
    ADD CONSTRAINT "tournament_team_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id");



ALTER TABLE ONLY "public"."tournament_team"
    ADD CONSTRAINT "tournament_team_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_team"
    ADD CONSTRAINT "user_team_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id");



ALTER TABLE ONLY "public"."user_team"
    ADD CONSTRAINT "user_team_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id");



CREATE POLICY "(temp) Enable update for authenticated users only" ON "public"."game" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."game" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."game_team" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."player" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for users based on user permission" ON "public"."player_team" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_user_admin"("auth"."uid"()) AS "is_user_admin"));



CREATE POLICY "Enable insert for users based on user permission" ON "public"."team" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_user_super_admin"("auth"."uid"()) AS "is_user_super_admin"));



CREATE POLICY "Enable insert for users based on user permission" ON "public"."user_team" FOR INSERT WITH CHECK ("public"."is_user_admin"("auth"."uid"()));



CREATE POLICY "Enable read access for all users" ON "public"."game" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."game_team" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."player" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."region" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."team" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."tournament" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."tournament_team" FOR SELECT USING (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."player_team" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable users to view their own data only" ON "public"."user" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."user_team" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."game" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_action" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_team" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."player" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."player_team" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."region" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tournament" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tournament_team" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_team" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."player";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
























































































































SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;

































SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;















GRANT ALL ON TABLE "public"."game" TO "anon";
GRANT ALL ON TABLE "public"."game" TO "authenticated";
GRANT ALL ON TABLE "public"."game" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_game"("game_name" "text", "teams" "public"."new_game_team"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."create_game"("game_name" "text", "teams" "public"."new_game_team"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_game"("game_name" "text", "teams" "public"."new_game_team"[]) TO "service_role";



GRANT ALL ON TABLE "public"."team" TO "anon";
GRANT ALL ON TABLE "public"."team" TO "authenticated";
GRANT ALL ON TABLE "public"."team" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_team_with_players"("team_name" "text", "player_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."create_team_with_players"("team_name" "text", "player_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_team_with_players"("team_name" "text", "player_ids" "uuid"[]) TO "service_role";



GRANT ALL ON TABLE "public"."tournament" TO "anon";
GRANT ALL ON TABLE "public"."tournament" TO "authenticated";
GRANT ALL ON TABLE "public"."tournament" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_tournament_for_team"("team_id" "uuid", "tournament_name" "text", "region_id" "uuid", "start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."create_tournament_for_team"("team_id" "uuid", "tournament_name" "text", "region_id" "uuid", "start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_tournament_for_team"("team_id" "uuid", "tournament_name" "text", "region_id" "uuid", "start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_team"("target_team_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_team"("target_team_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_team"("target_team_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_admin"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_admin"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_admin"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_super_admin"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_super_admin"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_super_admin"("target_user_id" "uuid") TO "service_role";



























GRANT ALL ON TABLE "public"."game_action" TO "anon";
GRANT ALL ON TABLE "public"."game_action" TO "authenticated";
GRANT ALL ON TABLE "public"."game_action" TO "service_role";



GRANT ALL ON TABLE "public"."game_team" TO "anon";
GRANT ALL ON TABLE "public"."game_team" TO "authenticated";
GRANT ALL ON TABLE "public"."game_team" TO "service_role";



GRANT ALL ON TABLE "public"."player" TO "anon";
GRANT ALL ON TABLE "public"."player" TO "authenticated";
GRANT ALL ON TABLE "public"."player" TO "service_role";



GRANT ALL ON TABLE "public"."player_team" TO "anon";
GRANT ALL ON TABLE "public"."player_team" TO "authenticated";
GRANT ALL ON TABLE "public"."player_team" TO "service_role";



GRANT ALL ON TABLE "public"."region" TO "anon";
GRANT ALL ON TABLE "public"."region" TO "authenticated";
GRANT ALL ON TABLE "public"."region" TO "service_role";



GRANT ALL ON TABLE "public"."tournament_team" TO "anon";
GRANT ALL ON TABLE "public"."tournament_team" TO "authenticated";
GRANT ALL ON TABLE "public"."tournament_team" TO "service_role";



GRANT ALL ON TABLE "public"."user" TO "anon";
GRANT ALL ON TABLE "public"."user" TO "authenticated";
GRANT ALL ON TABLE "public"."user" TO "service_role";



GRANT ALL ON TABLE "public"."user_team" TO "anon";
GRANT ALL ON TABLE "public"."user_team" TO "authenticated";
GRANT ALL ON TABLE "public"."user_team" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
