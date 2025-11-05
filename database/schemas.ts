import { ObjectSchema } from 'realm';

export type Verb = {
    id:      number;
    value:   string;
    groupId: number;
    readonly type: "Verb";
};

export type Agent = {
    id:    number;
    value: string;
    readonly type: "Agent";
};

export type Patient = {
    id:    number;
    value: string;
    readonly type: "Patient";
};

export type AgentVerbPatient_Trio = {
    id:        number;
    verbId:    number;
    agentId:   number;
    patientId: number;
    isFitting: boolean;
    readonly type: "AgentVerbPatient_Trio";
};


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

type ApiCombination = {
  id: number;
  subject: { id: number; text: string };
  verb: { id: number; text: string };
  object: { id: number; text: string };
  sentence: string;
};

export type ApiResponse = {
  success: boolean;
  data: ApiCombination[];
};

export function mapAVP_ApiToTrio(apiData: ApiResponse): AgentVerbPatient_Trio[] {
    return apiData.data.map(item => ({
        id:        item.id,
        verbId:    item.verb.id,
        agentId:   item.subject.id,
        patientId: item.object.id,
        isFitting: true,
        type:      "AgentVerbPatient_Trio"

    }));
}