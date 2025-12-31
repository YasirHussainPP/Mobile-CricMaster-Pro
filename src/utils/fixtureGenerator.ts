export const generateFixtures = (teams: any[], format: string) => {
  let fixtures = [];

  if (format === 'league') {
    // Round Robin Logic: Team A vs All, Team B vs remaining, etc.
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        fixtures.push({
          id: `match_${Math.random().toString(36).substr(2, 9)}`,
          teamA: teams[i].name,
          teamB: teams[j].name,
          status: 'scheduled',
          type: 'league'
        });
      }
    }
  } else {
    // Knockout Logic: Pair adjacent teams
    for (let i = 0; i < teams.length; i += 2) {
      fixtures.push({
        id: `ko_${i}`,
        teamA: teams[i].name,
        teamB: teams[i + 1] ? teams[i + 1].name : 'BYE', // If odd number of teams
        status: 'scheduled',
        type: 'knockout',
        round: 1
      });
    }
  }
  return fixtures;
};