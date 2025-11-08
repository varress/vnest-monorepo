import { ObjectSchema } from 'realm';

export type BaseWord = {
  id: number;
  value: string;
  readonly type: "Verb" | "Agent" | "Patient";
};

export type Verb = BaseWord & {
    groupId: number;
    readonly type: "Verb";
};

export type Agent = BaseWord & {
    readonly type: "Agent";
};

export type Patient = BaseWord & {
    readonly type: "Patient";
};

export type Word = Verb | Agent | Patient;

export type AgentVerbPatient_Trio = {
    id:        number;
    verbId:    number;
    agentId:   number;
    patientId: number;
    isFitting: boolean;
    readonly type: "AgentVerbPatient_Trio";
};

export type CorrectAnswer = {
    id:        number;
    trioId:    number;
    createdAt: Date;
    type:      "Correct Answer"
}

// Realm Schemas
export const VerbSchema: ObjectSchema = {
    name:       'Verb',
    primaryKey: 'id',
    properties: {
        id:      'int',
        value:   'string',
        groupId: { type: 'int', default: 0},
        type:    { type: 'string', default: 'Verb' }
    }
};

export const AgentSchema: ObjectSchema = {
    name:       'Agent',
    primaryKey: 'id',
    properties: {
        id:     'int',
        value:  'string',
        type:   { type: 'string', default: 'Agent' }
    }
};

export const PatientSchema: ObjectSchema = {
    name:       'Patient',
    primaryKey: 'id',
    properties: {
        id:     'int',
        value:  'string',
        type:   { type: 'string', default: 'Patient' }
    }
};

export const AgentVerbPatient_Trio_Schema: ObjectSchema = {
    name:          'AgentVerbPatient_Trio',
    primaryKey:    'id',
    properties: {
        id:        'int',
        agentId:   'int',
        verbId:    'int',
        patientId: 'int',
        type:      { type: 'string', default: 'AgentVerbPatient_Trio' }
    }
};

export const CorrectAnswer_Schema: ObjectSchema = {
    name:          'CorrectAnswer',
    primaryKey:    'id',
    properties: {
        id:        'int',
        trioId:    'int',
        createdAt: 'date',
        type:      { type: 'string', default: 'CorrectAnswer' }
    }
}

export type ApiCombination = {
  id: number;
  subject: { id: number; text: string };
  verb: { id: number; text: string };
  object: { id: number; text: string };
  sentence: string;
};

export type ApiWord = {
    id: number;
    text: string;
    type: string;
    group_id?: number;
    created_at: string;
}

export type ApiResponse<T> = {
  success: boolean;
  data: T[];
};

export function mapAVP_ApiToTrio(apiData: ApiResponse<ApiCombination>): AgentVerbPatient_Trio[] {
    return apiData.data.map(item => ({
        id:        item.id,
        verbId:    item.verb.id,
        agentId:   item.subject.id,
        patientId: item.object.id,
        isFitting: true,
        type:      "AgentVerbPatient_Trio"

    }));
}

export function mapAPIWord_UIWord (apiData: ApiResponse<ApiWord>):  Word[] {
    return apiData.data.map((item): Word =>  {
        switch (item.type) {
            case "VERB":
                return {
                    id: item.id,
                    value: item.text,
                    groupId: item.group_id ?? 0,
                    type: "Verb"
                };
            case "SUBJECT":
                return {
                    id: item.id,
                    value: item.text,
                    type: "Agent"
                };
            case "OBJECT":
                return {
                    id: item.id,
                    value: item.text,
                    type: "Patient"
                };
            default: {
                throw new Error(`Only types VERB, OBJECT, SUBJECT allowed, but got ${item.type}`);
            }
        }
    });
}  