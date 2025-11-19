import { AgentVerbPatient_Trio } from "@/database/schemas";
import { IBaseController } from "./IBaseController";

export interface IAVPTrioController extends IBaseController<AgentVerbPatient_Trio> {
    GetRandomByVerbId(verbId: number, count?: number): Promise<AgentVerbPatient_Trio[]>;
    IsCorrentCombination(agentId: number, verbId: number, patientId: number): Promise<boolean>;
    GetIdByAgentVerbPatient(agentId: number, verbId: number, patientId: number): Promise<number>;
}