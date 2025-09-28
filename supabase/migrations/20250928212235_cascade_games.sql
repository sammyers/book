alter table "public"."game_team" drop constraint "game_team_game_id_fkey";

alter table "public"."game_team" add constraint "game_team_game_id_fkey" FOREIGN KEY (game_id) REFERENCES game(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."game_team" validate constraint "game_team_game_id_fkey";


