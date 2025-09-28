import GamePage from "./GamePage";

export default async function GameLayout({ params }: LayoutProps<"/game/[gameId]">) {
  const { gameId } = await params;

  return (
    <div className="h-full flex flex-col bg-background relative pb-16">
      <GamePage gameId={gameId} />
    </div>
  );
}
