import { SlideTemplateData } from "../../types/slide-template";
import { SafeArea } from "./SlideLayout";

interface Template01Data extends SlideTemplateData {
  title: string;
  date?: string;
  summaryItems: { icon?: string; text: string }[];
  metrics: { label: string; value: string; reference?: string; target?: string }[];
  colors?: { accent: string; primary: string };
}

function Container({ text, accent }: { text: string; accent: string }) {
  void accent;
  return (
    <div className="content-stretch flex min-h-[44px] items-start relative w-full" data-name="Container">
      <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[1.4] not-italic relative text-[#18191e] text-[32px]">
        {text}
      </p>
    </div>
  );
}

function MetricCard({ label, value, reference, target, accent }: { label: string; value: string; reference?: string; target?: string; accent: string }) {
  return (
    <div className="bg-[#f5f5f5] flex-[1_0_0] min-w-px relative">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[22px] items-center px-[40px] py-[32px] relative size-full">
          <div className="[word-break:break-word] content-stretch flex flex-col font-['Gen_Interface_JP_Display:SemiBold',sans-serif] gap-[12px] items-center leading-[normal] not-italic relative shrink-0 whitespace-nowrap">
            <p className="relative shrink-0 text-[30px]" style={{ color: accent }}>{label}</p>
            <p className="relative shrink-0 text-[#18191e] text-[60px]">{value}</p>
          </div>
          <div className="h-0 relative shrink-0 w-full">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 480 1">
                <line stroke="#18191e" x2="480" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[14px] items-center w-full">
            {reference && (
              <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[28px] whitespace-nowrap">
                {reference}
              </p>
            )}
            <div className="flex items-baseline gap-[16px]">
              <p className="relative shrink-0 text-[20px]" style={{ color: accent }}>目標</p>
              <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:SemiBold',sans-serif] relative shrink-0 text-[#18191e] text-[36px] whitespace-nowrap">{target || '---'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Template01({ data }: { data: Template01Data }) {
  const accent = data.colors?.accent || '#c4ab46';

  return (
    <div className="bg-white relative size-full" data-name="template01">
      <SafeArea>
        <div className="absolute h-[77px] left-0 top-0 w-[920px]" data-name="Heading1">
          <p className="[word-break:break-word] absolute font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] left-0 not-italic text-[#18191e] text-[64px] top-0 whitespace-nowrap">
            {data.title}
          </p>
        </div>

        {/* タイトル下からbottom-0まで flex column で24px gap固定 */}
        <div className="absolute left-0 right-0 top-[125px] bottom-0 flex flex-col gap-[24px]">
          <div className="bg-[#f5f5f5] flex-1 flex flex-col gap-[32px] items-start justify-center px-[64px] py-[56px] overflow-hidden" data-name="summary">
            {data.summaryItems.map((item, index) => (
              <Container key={index} text={item.text} accent={accent} />
            ))}
          </div>

          <div className="flex gap-[24px] shrink-0" data-name="metrics">
            {data.metrics.map((metric, index) => (
              <MetricCard
                key={index}
                label={metric.label}
                value={metric.value}
                reference={metric.reference}
                target={metric.target}
                accent={accent}
              />
            ))}
          </div>
        </div>
      </SafeArea>
    </div>
  );
}
