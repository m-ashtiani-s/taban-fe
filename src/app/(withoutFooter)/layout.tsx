"use client";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "../_components/header/header";
import { useEffect } from "react";
import { OrderState, useOrderStore } from "./translation-order/_store/rate.store";

export default function Layout({ children }: { children: React.ReactNode }) {
	const { order, setOrder }: OrderState = useOrderStore();
	const pathname = usePathname();
	const router = useRouter();
	
	useEffect(() => {
		setOrder({
			language: {
				languageId: "691e1aef975bba3adfcb1595",
				languageName: "انگلیسی",
				languageCode: "en",
				icon: "",
				isActive: true,
			},
			translationItem: {
				translationItemId: "691e192c8a9bc32f0f96a2cd",
				title: "شناسنامه",
				documentType: "SHENASNAMEH",
				isActive: true,
				description: "",
				categoryId: "69235501d8f9befeae24719e",
				categoryName: "مدارک شخصی 1",
			},
			specialItems: [
				{
					count: 56,
					dynamicRateId: "69202ae4c7fc05db1cc35c13",
					price: 1100000,
					label: "تعدادفرزند درج شده در شناسنامه",
				},
				{
					count: 5,
					dynamicRateId: "693bee706c2b7339765e2707",
					price: 52000,
					label: "تعداد برگه های مربوط به سند",
				},
				{
					count: 5,
					dynamicRateId: "693bee826c2b7339765e2710",
					price: 41000,
					label: "تعداد همسر درج شده در شناسنامه",
				},
			],
			justiceCertification: {
				price: 63500000,
			},
			mfaCertification: {
				price: 14800000,
			},
			justiceInquiriesItems: [
				{
					justiceInquiryRateId: "693c64426c2b7339765e2f69",
					translationItemId: "691e192c8a9bc32f0f96a2cd",
					translationItemName: "شناسنامه",
					translationItemIsActive: true,
					languageId: "691e1aef975bba3adfcb1595",
					languageName: "انگلیسی",
					languageIsActive: true,
					justiceInquiryId: "69206b5208ceafd9435d9f15",
					justiceInquiryName: "استعلام از آموزش پرورش2",
					justiceInquiryIsActive: true,
					price: 8787,
					isRequired: false,
				},
				{
					justiceInquiryRateId: "693c64526c2b7339765e2f83",
					translationItemId: "691e192c8a9bc32f0f96a2cd",
					translationItemName: "شناسنامه",
					translationItemIsActive: true,
					languageId: "691e1aef975bba3adfcb1595",
					languageName: "انگلیسی",
					languageIsActive: true,
					justiceInquiryId: "69315e3a1fbe23c01dcdbb01",
					justiceInquiryName: "استعلام خانه در چین از وزارت مسکن",
					justiceInquiryIsActive: true,
					price: 6556,
					isRequired: false,
				},
				{
					justiceInquiryRateId: "693c650d6c2b7339765e2fa5",
					translationItemId: "691e192c8a9bc32f0f96a2cd",
					translationItemName: "شناسنامه",
					translationItemIsActive: true,
					languageId: "691e1aef975bba3adfcb1595",
					languageName: "انگلیسی",
					languageIsActive: true,
					justiceInquiryId: "69206b6d08ceafd9435d9f1b",
					justiceInquiryName: "استعلام از دانشگاه آزاد",
					justiceInquiryIsActive: true,
					price: 1230000,
					isRequired: false,
				},
				{
					justiceInquiryRateId: "693c644b6c2b7339765e2f76",
					translationItemId: "691e192c8a9bc32f0f96a2cd",
					translationItemName: "شناسنامه",
					translationItemIsActive: true,
					languageId: "691e1aef975bba3adfcb1595",
					languageName: "انگلیسی",
					languageIsActive: true,
					justiceInquiryId: "69242ffea94cd93df157c7ce",
					justiceInquiryName: "استعلام جدید",
					justiceInquiryIsActive: true,
					price: 5677777,
					isRequired: false,
				},
			],
		});
		// if (pathname !== "/translation-order/translation-item" && !order) {
		// 	router.push("/translation-order/translation-item");
		// }
	}, []);

	console.log(order);
	return (
		<>
			<Header />
			<div className="h-[calc(100dvh)] pt-[100px]">{order && children}</div>
		</>
	);
}
