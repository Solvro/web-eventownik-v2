declare module "@faker-js/faker" {
  export interface FakerDateModule {
    recent: (options?: { days?: number }) => Date;
  }

  export interface FakerHelpersModule {
    arrayElement: <T>(array: readonly T[]) => T;
    slugify: (input: string) => string;
  }

  export interface FakerInternetModule {
    email: () => string;
  }

  export interface FakerPersonModule {
    fullName: () => string;
  }

  export interface Faker {
    date: FakerDateModule;
    helpers: FakerHelpersModule;
    internet: FakerInternetModule;
    person: FakerPersonModule;
  }

  export const faker: Faker;
}
