import fs from "fs";
import path from "path";
import { log } from "../core/logger.js";

const MISSIONS_ROOT = path.resolve("./missions");

const STATES = Object.freeze([
  "CREATED",
  "PLANNED",
  "EXECUTING_DEV",
  "BUILDING",
  "TESTING",
  "AUDITING",
  "READY_FOR_DECISION",
  "COMMITTED",
  "ROLLED_BACK",
  "FAILED"
]);

const ALLOWED_TRANSITIONS = Object.freeze({
  CREATED: ["PLANNED", "FAILED"],
  PLANNED: ["EXECUTING_DEV", "FAILED"],
  EXECUTING_DEV: ["BUILDING", "FAILED"],
  BUILDING: ["TESTING", "FAILED"],
  TESTING: ["AUDITING", "FAILED"],
  AUDITING: ["READY_FOR_DECISION", "FAILED"],
  READY_FOR_DECISION: ["COMMITTED", "ROLLED_BACK", "FAILED"],
  COMMITTED: [],
  ROLLED_BACK: [],
  FAILED: []
});

class MissionState {
  constructor(missionId) {
    if (!missionId) {
      throw new Error("Mission ID is required");
    }

    this.missionId = missionId;
    this.missionPath = path.join(MISSIONS_ROOT, missionId);

    this._ensureDirectories();
    this.stateFile = path.join(this.missionPath, "state.json");

    if (!fs.existsSync(this.stateFile)) {
      this._initialize();
    }

    this._load();
  }

  _ensureDirectories() {
    if (!fs.existsSync(MISSIONS_ROOT)) {
      fs.mkdirSync(MISSIONS_ROOT, { recursive: true });
    }

    if (!fs.existsSync(this.missionPath)) {
      fs.mkdirSync(this.missionPath, { recursive: true });
    }
  }

  _initialize() {
    const initialState = {
      missionId: this.missionId,
      currentState: "CREATED",
      history: [
        {
          state: "CREATED",
          timestamp: new Date().toISOString()
        }
      ]
    };

    fs.writeFileSync(
      this.stateFile,
      JSON.stringify(initialState, null, 2)
    );

    log("Mission " + this.missionId + " initialized in CREATED state");
  }

  _load() {
    const raw = fs.readFileSync(this.stateFile, "utf-8");
    this.data = JSON.parse(raw);
  }

  _save() {
    fs.writeFileSync(
      this.stateFile,
      JSON.stringify(this.data, null, 2)
    );
  }

  getCurrentState() {
    return this.data.currentState;
  }

  transitionTo(nextState) {
    const currentState = this.data.currentState;

    if (!STATES.includes(nextState)) {
      throw new Error("Invalid state: " + nextState);
    }

    const allowed = ALLOWED_TRANSITIONS[currentState] || [];

    if (!allowed.includes(nextState)) {
      throw new Error(
        "Illegal transition: " + currentState + " → " + nextState
      );
    }

    this.data.currentState = nextState;

    this.data.history.push({
      state: nextState,
      timestamp: new Date().toISOString()
    });

    this._save();

    log(
      "Mission " + this.missionId +
      " transitioned: " + currentState +
      " → " + nextState
    );
  }

  getHistory() {
    return this.data.history;
  }
}

export default MissionState;
