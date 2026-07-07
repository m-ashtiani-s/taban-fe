"use client";

import { useParams } from "next/navigation";
import { slugToStep } from "../_config/steps";
import { useOrderFlow } from "../_context/orderFlow.context";
import SelectItemStep from "../_components/steps/selectItemStep/selectItemStep";
import NamingStep from "../_components/steps/namingStep/namingStep";
import LanguageStep from "../_components/steps/languageStep/languageStep";
import BaseStep from "../_components/steps/baseStep/baseStep";
import SpecialsStep from "../_components/steps/specialsStep/specialsStep";
import CertificationsStep from "../_components/steps/certificationsStep/certificationsStep";
import InquiriesStep from "../_components/steps/inquiriesStep/inquiriesStep";
import EmbassyStep from "../_components/steps/embassyStep/embassyStep";
import UploadStep from "../_components/steps/uploadStep/uploadStep";
import PassportStep from "../_components/steps/passportStep/passportStep";
import CopiesStep from "../_components/steps/copiesStep/copiesStep";
import ScanStep from "../_components/steps/scanStep/scanStep";
import CheckoutStep from "../_components/steps/checkoutStep/checkoutStep";

/**
 * رندرِ سبکِ مرحله‌ی جاری بر اساس سِگمنت URL. تمام state و ناوبری در لایوت مدیریت می‌شود؛
 * این کامپوننت فقط کامپوننتِ مرحله‌ی متناظر را با props موردنیازش (از context) رندر می‌کند.
 * اگر slug نامعتبر باشد، لایوت ریدایرکت می‌کند و اینجا چیزی رندر نمی‌شود.
 */
export default function StepPage() {
	const params = useParams<{ step: string }>();
	const step = slugToStep(params?.step);
	const { rates, onSelectItem, onSelectLanguage, resetSteps } = useOrderFlow();

	switch (step) {
		case "selectItem":
			return <SelectItemStep onSelectItem={onSelectItem} />;
		case "naming":
			return <NamingStep />;
		case "language":
			return <LanguageStep rates={rates} onSelectLanguage={onSelectLanguage} />;
		case "base":
			return <BaseStep rates={rates} />;
		case "specials":
			return <SpecialsStep rates={rates} />;
		case "certifications":
			return <CertificationsStep rates={rates} />;
		case "inquiries":
			return <InquiriesStep rates={rates} />;
		case "embassy":
			return <EmbassyStep rates={rates} />;
		case "upload":
			return <UploadStep />;
		case "passport":
			return <PassportStep />;
		case "copies":
			return <CopiesStep />;
		case "scan":
			return <ScanStep rates={rates} />;
		case "checkout":
			return <CheckoutStep resetSteps={resetSteps} />;
		default:
			return null;
	}
}
