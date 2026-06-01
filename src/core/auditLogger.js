export default class AuditLogger {

  static log(event, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      data
    };

    console.log("AUDIT:", JSON.stringify(entry));
  }

}
