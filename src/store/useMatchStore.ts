import { create } from 'zustand';

// 1. Define Sub-Interfaces for Clarity
export interface Ball {
  label: string;
  runs: number;
  isLegal: boolean;
}

export interface Batter {
  name: string;
  isCaptain?: boolean;
  isWicketKeeper?: boolean;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  wickets: number;
  dismissal: string;
}

export interface Bowler {
  name: string;
  overs: number; // Stored as total balls, converted to 0.0 in UI
  runsConceded: number;
  wickets: number;
  maidens: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
}

// 2. Define the Main State Interface
interface MatchState {
  // Global Match Stats
  partnerships: { batters: string[], runs: number, balls: number }[];
  currentPartnership: { runs: number, balls: number };
  firstInningsScore: number;
  firstInningsWickets: number;
  firstInningsBatters: Batter[];
  firstInningsBowlers: Bowler[];
  firstInningsBalls: number;  
  firstInningsExtras: number;
  runs: number;
  wickets: number;
  balls: number;
  overHistory: Ball[];
  bowlingPlayers: Bowler[];

  // Players Data
  battingPlayers: Batter[];
  bowlers: Bowler[];

  // Tracking Pointers
  strikerIdx: number;
  nonStrikerIdx: number;
  currentBowlerIdx: number;

  // Extras
  extras: {
    wide: number;
    noBall: number;
    bye: number;
    legBye: number;


  };




  // Actions
  initMatch: (battingSquad: any[], bowlingSquad: any[], strikerIdx: number, nonStrikerIdx: number, bowlerIdx: number) => void;
  addBall: (ballType: 'Legal' | 'Wide' | 'NoBall' | 'Wicket', extraRuns?: number) => void;
  rotateStrike: () => void;
  resetMatch: () => void;
  setNextBatter: (batterIdx: number) => void;
  setNextBowler: (bowlerIdx: number) => void;
  setDismissal: (batterIdx: number, type: string, fielder?: string, bowlerName?: string) => void;
  isSecondInnings: boolean;
  setInnings: (isSecond: boolean) => void;

}

// 3. Create the Store
export const useMatchStore = create<MatchState>((set) => ({
  // Initial Values
  partnerships: [] as { batters: string[], runs: number, balls: number }[],
  currentPartnership: { runs: 0, balls: 0 },
  firstInningsScore: 0,
  firstInningsWickets: 0,
  firstInningsBatters: [],
  firstInningsBowlers: [],
  firstInningsBalls: 0,
  firstInningsExtras: 0,
  bowlingPlayers: [],
  runs: 0,
  wickets: 0,
  balls: 0,
  overHistory: [],
  battingPlayers: [],
  bowlers: [],
  strikerIdx: 0,
  nonStrikerIdx: 1,
  currentBowlerIdx: 0,
  extras: {
    wide: 0,
    noBall: 0,
    bye: 0,
    legBye: 0,
  } as const,

  setNextBatter: (batterIdx: number) => set((state: MatchState) => ({
    strikerIdx: batterIdx,
    partnerships: [...state.partnerships, {
    batters: [state.battingPlayers[state.strikerIdx].name, state.battingPlayers[state.nonStrikerIdx].name],
    runs: state.currentPartnership.runs,
    balls: state.currentPartnership.balls
  }],
  currentPartnership: { runs: 0, balls: 0 }
  })),



  isSecondInnings: false,
  // Inside useMatchStore.ts
  // Update your setInnings action
  setInnings: (val) => set((state) => ({
  isSecondInnings: val,
  firstInningsScore: state.runs,
  firstInningsWickets: state.wickets,
  firstInningsBatters: [...state.battingPlayers],
  firstInningsBowlers: [...state.bowlers],
  firstInningsExtras: (state.extras.wide + state.extras.noBall + state.extras.bye + state.extras.legBye),
  extras: { wide: 0, noBall: 0, bye: 0, legBye: 0 },
  runs: 0, wickets: 0, balls: 0,
})),

  setDismissal: (batterIdx, type, fielder, bowlerName) => set((state) => {
    const players = [...state.battingPlayers];
    let status = "";

    if (type === 'Bowled') status = `b ${bowlerName}`;
    if (type === 'Caught') status = `c ${fielder} b ${bowlerName}`;
    if (type === 'LBW') status = `lbw b ${bowlerName}`;
    if (type === 'Run Out') status = `run out (${fielder})`;
    if (type === 'Stumped') status = `st (wk) b ${bowlerName}`;

    players[batterIdx].isOut = true;
    players[batterIdx].dismissal = status;
    return { battingPlayers: players };
  }),

  setNextBowler: (bowlerIdx: number) => set((state: MatchState) => ({
    currentBowlerIdx: bowlerIdx,
    overHistory: [],
  })),


  // Helper to initialize players
  // Define the types clearly in the function signature
  initMatch: (
    battingSquad: any[],
    bowlingSquad: any[],
    strikerIdx: number,
    nonStrikerIdx: number,
    bowlerIdx: number
  ) => set({
    battingPlayers: battingSquad.map((p: any) => ({ // Fixes 'p' error
      ...p,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      dismissal: ''
    })),
    bowlers: bowlingSquad.map((p: any) => ({ // Fixes 'p' error
      ...p,
      overs: 0,
      runsConceded: 0,
      wickets: 0,
      maidens: 0
    })),
    strikerIdx,    // TypeScript now knows these are numbers
    nonStrikerIdx,
    currentBowlerIdx: bowlerIdx,
    runs: 0,
    wickets: 0,
    balls: 0,
    overHistory: []
  }),

  addBall: (ballType, extraRuns = 0) => set((state) => {
    // Clone state to avoid direct mutation
    const newBattingPlayers = [...state.battingPlayers];
    const newBowlers = [...state.bowlers];
    const newExtras = { ...state.extras };


    let { runs, wickets, balls, strikerIdx, nonStrikerIdx, currentBowlerIdx, overHistory } = state;

    const ballLabel = ballType === 'Wide' ? `W+${runs}` :
      ballType === 'NoBall' ? `N+${runs}` :
        ballType === 'Wicket' ? 'W' : `${runs}`;
    const newBall = {
      label: ballLabel,
      runs: runs + (ballType === 'Legal' ? 0 : 1), // Extra run for Wide/NB
      isLegal: ballType === 'Legal' || ballType === 'Wicket',
    };
    const currentStriker = newBattingPlayers[strikerIdx];
    const currentBowler = newBowlers[currentBowlerIdx];

    if (ballType === 'Legal') {
      currentStriker.runs += extraRuns;
      currentStriker.balls += 1;
      if (extraRuns === 4) currentStriker.fours += 1;
      if (extraRuns === 6) currentStriker.sixes += 1;

      currentBowler.runsConceded += extraRuns;
      currentBowler.overs += 1;

      runs += extraRuns;
      balls += 1;

      // Rotate strike on odd runs
      if (extraRuns % 2 !== 0) {
        [strikerIdx, nonStrikerIdx] = [nonStrikerIdx, strikerIdx];
      }

      overHistory.push({ label: extraRuns.toString(), runs: extraRuns, isLegal: true });
    }

    else if (ballType === 'Wide') {
      newExtras.wide += (1 + extraRuns);
      runs += (1 + extraRuns);
      currentBowler.runsConceded += (1 + extraRuns);
      overHistory.push({ label: 'Wd', runs: 1 + extraRuns, isLegal: false });
    }

    else if (ballType === 'NoBall') {
      newExtras.noBall += 1;
      currentStriker.runs += extraRuns; // Runs off a No Ball go to batter
      runs += (1 + extraRuns);
      currentBowler.runsConceded += (1 + extraRuns);
      overHistory.push({ label: 'NB', runs: 1 + extraRuns, isLegal: false });
    }

    else if (ballType === 'Wicket') {
      currentStriker.balls += 1;
      currentStriker.isOut = true;
      wickets += 1;
      balls += 1;
      currentBowler.overs += 1;
      currentBowler.wickets += 1;
      overHistory.push({ label: 'W', runs: 0, isLegal: true });
      // Note: Logic to select new batter will be handled in UI
    }

    // End of Over rotation
    if (balls > 0 && balls % 6 === 0 && ballType !== 'Wide' && ballType !== 'NoBall') {
      [strikerIdx, nonStrikerIdx] = [nonStrikerIdx, strikerIdx];
      overHistory = []; // Clear for next over
    }

    const isLegal = ballType === 'Legal' || ballType === 'Wicket';
    return {
      runs,
      wickets,
      balls,
      battingPlayers: newBattingPlayers,
      bowlers: newBowlers,
      extras: newExtras,
      strikerIdx,
      nonStrikerIdx,
      overHistory,
      currentPartnership: {
      runs: state.currentPartnership.runs + runs + (isLegal ? 0 : 1),
      balls: state.currentPartnership.balls + (isLegal ? 1 : 0)
    }
    };
  }),

  rotateStrike: () => set((state) => ({
    strikerIdx: state.nonStrikerIdx,
    nonStrikerIdx: state.strikerIdx
  })),

  resetMatch: () => set({
    runs: 0, wickets: 0, balls: 0, overHistory: [],
    strikerIdx: 0, nonStrikerIdx: 1, currentBowlerIdx: 0,
    extras: { wide: 0, noBall: 0, bye: 0, legBye: 0 }
  })
}));