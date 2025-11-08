declare module "@/database/realm" {
  import type Realm from "realm";

  export function getRealm(): Promise<Realm>;
  export function getRealm_IgnoreSeeding(): Promise<Realm>;
  export const realmConfig: Realm.Configuration;
}
