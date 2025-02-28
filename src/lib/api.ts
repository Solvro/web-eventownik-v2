export const API_URL = process.env.EVENTOWNIK_API ?? "";
export const PHOTO_URL = process.env.PHOTO_URL ?? "";

if (API_URL === "") {
  throw new Error("EVENTOWNIK_API was not set in enviroment variables!");
}

if (PHOTO_URL === "") {
  throw new Error("PHOTO_URL was not set in enviroment variables!");
}
