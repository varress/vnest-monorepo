import { Agent, AgentVerbPatient_Trio, Patient, Verb } from "@/database/schemas";

export interface WordBundle {
    verb: Verb | null;
    subjects: Agent[] | null;
    objects: Patient[] | null;
    pairings: AgentVerbPatient_Trio[] | null;
}