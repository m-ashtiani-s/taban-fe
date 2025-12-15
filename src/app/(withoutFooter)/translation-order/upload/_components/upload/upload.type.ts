import { Res } from "@/types/responseType"
import { DynamicRate } from "../../../_types/dynamicRate.type";
import { CertificationRate } from "../../../_types/certificationRate.type";
import { JusticeInquiryRate } from "../../../_types/justiceInquiry.type";
import { Result } from "@/types/result";

export type UploadProps={
    dynamicRatesResult:Result<Res<DynamicRate[]>> | null;
    certificationRatesResult:Result<Res<CertificationRate[]>> | null;
    justiceInquiryRatesResult:Result<Res<JusticeInquiryRate[]>> | null;
}