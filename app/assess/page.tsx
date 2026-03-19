import FormWizard from "@/components/FormWizard";

export const metadata = {
  title: "开始计算 - WealthSpan",
  description: "填写您的收入、社保、资产信息，精算终身财富和养老缺口",
};

export default function AssessPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <FormWizard />
    </div>
  );
}
