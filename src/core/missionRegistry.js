import fs from "fs";
import _path from "path";

const REGISTRY_PATH = "./registry/missions.json";

class MissionRegistry {
  constructor() {
    if (!fs.existsSync("./registry")) {
      fs.mkdirSync("./registry");
    }

    if (!fs.existsSync(REGISTRY_PATH)) {
      fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ missions: [] }, null, 2));
    }
  }

  load() {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  }

  save(data) {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2));
  }

  addMission(missionId, sandboxPath) {
    const data = this.load();
    data.missions.push({
      missionId,
      sandboxPath,
      createdAt: new Date().toISOString(),
      status: "READY_FOR_DECISION"
    });
    this.save(data);
  }

  updateStatus(missionId, status) {
    const data = this.load();
    const mission = data.missions.find(m => m.missionId === missionId);
    if (mission) {
      mission.status = status;
      mission.updatedAt = new Date().toISOString();
      this.save(data);
    }
  }
}

export default MissionRegistry;
