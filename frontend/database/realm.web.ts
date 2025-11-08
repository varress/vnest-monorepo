console.warn("Realm is not available on web — using stub implementation.");

export const getRealm_IgnoreSeeding = async (): Promise<never> => {
    throw new Error("Realm is not supported on web");
};

export const getRealm = async (): Promise<never> => {
    throw new Error("Realm is not supported on web");
};