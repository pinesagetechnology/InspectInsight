import { IFCPopulatedConditionRating } from "../entities/inspection";

export interface SubmitDatapayload {
    ifcPopulatedConditionRating: IFCPopulatedConditionRating[]
    callback: ()=> void;

}