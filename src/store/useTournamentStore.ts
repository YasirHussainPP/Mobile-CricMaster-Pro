import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface Team {
  name: string;
  players: any[];
  stats: {
    played: number;
    won: number;
    lost: number;
    points: number;
    nrr: number;
    totalRunsScored: number;
    totalBallsFaced: number;
    totalRunsConceded: number;
    totalBallsBowled: number;
  };
}

interface TournamentState {
  tournamentName: string;
  overs: number;
  teams: Team[];
  fixtures: any[];
  isLoading: boolean;

  // Actions
  setTournament: (name: string, teams: any[], fixtures: any[], overs: number) => Promise<void>;
  loadTournament: (name: string) => Promise<void>;
  updateMatchResult: (result: any) => Promise<void>;
  deleteTournament: (name: string) => Promise<void>;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  tournamentName: '',
  teams: [],
  fixtures: [],
  overs:5,
  isLoading: true,

  // Initialize a new or existing tournament
  setTournament: async (name, teams, fixtures, overs) => {
    // 1. Update local state
    set({ tournamentName: name, teams, fixtures, overs, isLoading: false });

    // 2. Persist to AsyncStorage immediately
    try {
      const stored = await AsyncStorage.getItem('all_tournaments');
      let all = stored ? JSON.parse(stored) : [];
      
      const newTournament = { tournamentName: name, teams, fixtures, overs };
      
      // Update if exists, otherwise add new
      const index = all.findIndex((t: any) => t.tournamentName === name);
      if (index > -1) {
        all[index] = newTournament;
      } else {
        all.push(newTournament);
      }
      
      await AsyncStorage.setItem('all_tournaments', JSON.stringify(all));
    } catch (e) {
      console.error("Failed to save tournament", e);
    }
  },

  // Load from AsyncStorage (Fixes the 5-minute loading hang)
  loadTournament: async (name: string) => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem('all_tournaments');
      if (stored) {
        const all = JSON.parse(stored);
        const current = all.find((t: any) => t.tournamentName === name);
        if (current) {
          set({ 
            tournamentName: current.tournamentName, 
            teams: current.teams, 
            fixtures: current.fixtures,
            isLoading: false 
          });
          return;
        }
      }
      set({ isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  // Update Points Table & Player Stats Instantly
  updateMatchResult: async (result: any) => {
    const { matchId, winner, loser, scoreA, ballsA, scoreB, ballsB, teamAName, playerStats } = result;
    const state = get();

    // 1. Update Fixtures
    const updatedFixtures = state.fixtures.map((f) =>
      f.id === matchId ? { ...f, status: 'completed', winner, scoreA, scoreB } : f
    );

    // 2. Update Teams (Points, NRR, and Individual Player Stats)
    const updatedTeams = state.teams.map((team) => {
      if (team.name !== winner && team.name !== loser) return team;

      let t = { ...team };
      t.stats.played += 1;
      if (t.name === winner) {
        t.stats.won += 1;
        t.stats.points += 2;
      } else {
        t.stats.lost += 1;
      }

      // Safe Math for NRR
      const isTeamA = t.name === teamAName;
      t.stats.totalRunsScored += isTeamA ? scoreA : scoreB;
      t.stats.totalBallsFaced += isTeamA ? ballsA : ballsB;
      t.stats.totalRunsConceded += isTeamA ? scoreB : scoreA;
      t.stats.totalBallsBowled += isTeamA ? ballsB : ballsA;

      const rf = t.stats.totalRunsScored / (t.stats.totalBallsFaced / 6 || 0.1);
      const ra = t.stats.totalRunsConceded / (t.stats.totalBallsBowled / 6 || 0.1);
      t.stats.nrr = rf - ra;

      // Update the specific players in this team from the match results
      t.players = t.players.map(p => {
        const matchP = playerStats.find((ps: any) => ps.name === p.name);
        if (matchP) {
          return {
            ...p,
            runs: (p.runs || 0) + (matchP.runs || 0),
            wickets: (p.wickets || 0) + (matchP.wickets || 0),
            innings: (p.innings || 0) + 1,
            balls: (p.balls || 0) + (matchP.balls || 0),
            runsConceded: (p.runsConceded || 0) + (matchP.runsConceded || 0),
            oversBowled: (p.oversBowled || 0) + (matchP.overs || 0)
          };
        }
        return p;
      });

      return t;
    });

    // 3. Save to Local Storage & State
    set({ teams: updatedTeams, fixtures: updatedFixtures });
    
    const stored = await AsyncStorage.getItem('all_tournaments');
    let all = stored ? JSON.parse(stored) : [];
    const index = all.findIndex((i: any) => i.tournamentName === state.tournamentName);
    if (index > -1) {
      all[index].teams = updatedTeams;
      all[index].fixtures = updatedFixtures;
      await AsyncStorage.setItem('all_tournaments', JSON.stringify(all));
    }
  },

  deleteTournament: async (name) => {
    const stored = await AsyncStorage.getItem('all_tournaments');
    if (stored) {
      const all = JSON.parse(stored).filter((t: any) => t.tournamentName !== name);
      await AsyncStorage.setItem('all_tournaments', JSON.stringify(all));
      set({ tournamentName: '', teams: [], fixtures: [] });
    }
  }
}));