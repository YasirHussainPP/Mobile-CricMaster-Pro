    // Put this in a utils file or at the top of your components
export const getPlayerDisplayName = (player: any) => {
  if (!player) return "";
  let name = player.name;
  if (player.isWicketKeeper) name += " (wk)";
  if (player.isCaptain) name += " (c)";
  return name;
};