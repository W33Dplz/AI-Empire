import MissionState from "./missionState.js";

const mission = new MissionState("mission-1");

console.log("Current:", mission.getCurrentState());

mission.transitionTo("PLANNED");
mission.transitionTo("EXECUTING_DEV");

console.log("History:", mission.getHistory());
