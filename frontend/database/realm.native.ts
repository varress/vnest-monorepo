import Realm from 'realm';

import {
    AgentSchema,
    AgentVerbPatient_Trio_Schema,
    CorrectAnswer_Schema,
    PatientSchema,
    VerbSchema
} from './schemas';
import { seedRealm } from './seedRealm';

let realmInstance: Realm | null = null;
let seeded = false;

export const realmConfig: Realm.Configuration = {
    path: "default.realm",
    schema: [AgentSchema, VerbSchema, PatientSchema, AgentVerbPatient_Trio_Schema, CorrectAnswer_Schema],
    deleteRealmIfMigrationNeeded: true

};

export const getRealm_IgnoreSeeding = async (): Promise<Realm> => {
    if (!realmInstance) {
        realmInstance = await Realm.open(realmConfig);
    }
    return realmInstance;
}

export const getRealm = async (): Promise<Realm> => {
    if (!realmInstance) {
        realmInstance = await Realm.open(realmConfig);
    }
    if (!seeded) { // Makes sure, that data is seeded, before the realm instance is usable.
        await seedRealm();
        seeded = true;
    }
    return realmInstance;
}