import { createSlice } from "@reduxjs/toolkit";

const moduleSlice = createSlice({
  name: "module",
  initialState: {
    link: "",
    currentModule: {},
    allModules: {},
    allFailures: [],
  },
  reducers: {
    addModules(state, action) {
      return { ...state, allModules: action.payload };
    },
    addCurrentModule(state, action) {
      return { ...state, currentModule: action.payload };
    },
    setAllureLink(state, action) {
      return { ...state, link: action.payload };
    },
    setBothCurrentAndAllModules(state, action) {
      const updateAllModules = state.allModules.reduce((acc, cur) => {
        if (cur.uid === action.payload.uid) {
          cur = action.payload;
        }
        acc.push(cur);
        return acc;
      }, []);
      return {
        ...state,
        currentModule: action.payload,
        allModules: updateAllModules,
      };
    },
    addAllFailures(state, action) {
      return { ...state, allFailures: action.payload };
    },
    clearState(state, action) {},
  },
});

export const { addModules, addCurrentModule, setAllureLink, setBothCurrentAndAllModules, addAllFailures, clearState } = moduleSlice.actions;
export default moduleSlice.reducer;
