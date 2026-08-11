import { getCountries } from "libphonenumber-js";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

// Include every country supported by the phone-number library, plus a general
// option for clients who do not want to provide a specific country yet.
const COUNTRIES = [
  { name: "General / Other", code: "ZZ" },
  ...getCountries()
    .map((code) => ({ name: countryNames.of(code), code }))
    .sort((a, b) => a.name.localeCompare(b.name)),
];

export default COUNTRIES;
