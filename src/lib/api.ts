export const API_URL = process.env.EVENTOWNIK_API ?? "";

if (API_URL === "") {
  throw new Error("EVENTOWNIK_API was not set in enviroment variables!");
}
