import { defaultSettings } from "@minutesbot/shared";

console.log("Seed data template:");
console.log(JSON.stringify({ settings: defaultSettings }, null, 2));
console.log("Apply through the Settings UI or insert into D1 using the settings key 'app'.");
