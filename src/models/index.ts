
export type Player = {
  id: string;
  name: string;
  isCaptain: boolean;
  isWK: boolean;
};

export type Team = {
  id: string;
  name: string;
  players: Player[];
};

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED';

export type Match = {
  id: string;
  teamA: Team;
  teamB: Team;
  overs: number;
  status: MatchStatus;
  winnerId?: string;
};