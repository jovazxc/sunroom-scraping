const {
  SUNROOM_USERNAME = "",
  SUNROOM_PASSWORD = "",
  SUNROOM_URLBASE = "",
  SPECTRUM_URLBASE = "",
} = process.env;

const HEADLESS =
  typeof process.env.HEADLESS !== "undefined"
    ? (JSON.parse(process.env.HEADLESS) as boolean)
    : false;

const PORT = Number(process.env.PORT || "3001");

export {
  SUNROOM_USERNAME,
  SUNROOM_PASSWORD,
  SUNROOM_URLBASE,
  SPECTRUM_URLBASE,
  HEADLESS,
  PORT,
};
