export const CHOGHADIYA_DAY: Record<number, string[]> = {
    0: ["Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"],
    1: ["Chal", "Kaal", "Shubh", "Rog", "Udveg", "Amrit", "Labh", "Chal"],
    2: ["Rog", "Udveg", "Amrit", "Shubh", "Chal", "Labh", "Kaal", "Rog"],
    3: ["Labh", "Amrit", "Rog", "Shubh", "Chal", "Kaal", "Udveg", "Labh"],
    4: ["Shubh", "Rog", "Labh", "Chal", "Udveg", "Amrit", "Kaal", "Shubh"],
    5: ["Chal", "Labh", "Shubh", "Kaal", "Udveg", "Rog", "Amrit", "Chal"],
    6: ["Kaal", "Shubh", "Chal", "Udveg", "Amrit", "Rog", "Labh", "Kaal"],
  };
  
  export const CHOGHADIYA_NIGHT: Record<number, string[]> = {
    0: ["Shubh", "Amrit", "Chal", "Rog", "Kaal", "Udveg", "Labh", "Shubh"],
    1: ["Chal", "Rog", "Kaal", "Labh", "Shubh", "Udveg", "Amrit", "Chal"],
    2: ["Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Rog", "Chal", "Kaal"],
    3: ["Udveg", "Shubh", "Amrit", "Chal", "Rog", "Labh", "Kaal", "Udveg"],
    4: ["Amrit", "Chal", "Rog", "Kaal", "Labh", "Shubh", "Udveg", "Amrit"],
    5: ["Rog", "Kaal", "Shubh", "Udveg", "Amrit", "Chal", "Labh", "Rog"],
    6: ["Labh", "Udveg", "Shubh", "Amrit", "Chal", "Rog", "Kaal", "Labh"],
  };
  
  export const getEffect = (name: string) => {
    if (name === "Amrit") return "Very Good";
    if (name === "Shubh" || name === "Labh") return "Good";
    if (name === "Chal") return "Normal";
    return "Bad";
  };
  