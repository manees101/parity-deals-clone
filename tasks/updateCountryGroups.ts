import { db } from "@/drizzle/db";
import countriesByDiscount from "../data/countriesByDiscount.json";
import { CountryGroupTable, CountryTable } from "@/drizzle/schema";
import { sql } from "drizzle-orm";
import { CACHE_TAGS, revalidateDbCache } from "@/lib/cache";
const updatedCountryGroups = await updateCountryGroups();
const updatedCountries = await updateCountries();
console.log(
  `Updated ${updatedCountryGroups} country groups and ${updatedCountries} countries`
);
async function updateCountryGroups() {
  const countryGroupsInsertData = countriesByDiscount.map(
    ({ name, recommendedDiscountPercentage }) => ({
      name,
      recommendedDiscountPercentage,
    })
  );
  const { rowCount } = await db
    .insert(CountryGroupTable)
    .values(countryGroupsInsertData)
    .onConflictDoUpdate({
      target: CountryGroupTable.name,
      set: {
        recommendedDiscountPercentage: sql.raw(
          `excluded.${CountryGroupTable.recommendedDiscountPercentage.name}`
        ),
      },
    });
  // revalidateDbCache(CACHE_TAGS.countryGroups);
  return rowCount;
}

async function updateCountries() {
  const countryGroups = await db.query.CountryGroupTable.findMany({
    columns: {
      id: true,
      name: true,
    },
  });
  const countriesInsertData = countriesByDiscount.flatMap(
    ({ countries, name }) => {
      const group = countryGroups.find((group) => group.name === name);
      if (group === undefined) {
        throw new Error(`Country group ${name} not found`);
      }
      return countries.map((country) => ({
        name: country.countryName,
        countryGroupId: group.id,
        code: country.country,
      }));
    }
  );
  const { rowCount } = await db
    .insert(CountryTable)
    .values(countriesInsertData)
    .onConflictDoUpdate({
      target: CountryTable.code,
      set: {
        countryGroupId: sql.raw(`excluded.${CountryTable.countryGroupId.name}`),
        name: sql.raw(`excluded.${CountryTable.name.name}`),
      },
    });
  // revalidateDbCache(CACHE_TAGS.countries);
  return rowCount;
}
