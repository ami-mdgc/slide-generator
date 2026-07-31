import { SlideTemplateData } from "../../types/slide-template";
import { SafeArea } from "./SlideLayout";

interface Template03Data extends SlideTemplateData {
  title: string;
  theme: { label: string; text: string };
  metrics: { label: string; value: string; reference: string; projected?: string }[];
  colors?: { accent: string; primary: string };
}

export default function Template03({ data }: { data: Template03Data }) {
  const accent = data.colors?.accent || '#c4ab46';

  return (
    <div className="bg-white relative size-full" data-name="template03">
      <SafeArea>
        <div className="absolute content-stretch flex items-center justify-center left-0 top-0" data-name="Heading1">
          <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[64px] whitespace-nowrap">
            {data.title}
          </p>
        </div>

        <div className="absolute bg-[#f5f5f5] content-stretch flex flex-col gap-[32px] items-center left-0 p-[64px] top-[125px] w-full" data-name="summary">
          <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[36px] whitespace-nowrap" style={{ color: accent }}>
            {data.theme.label}
          </p>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Heading1">
            <div className="[word-break:break-word] whitespace-pre-wrap font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[64px] text-center">
              {data.theme.text}
            </div>
          </div>
        </div>

        <div className="-translate-x-1/2 absolute content-stretch flex gap-[24px] items-center left-1/2 top-[509px] w-full">
          {data.metrics.map((metric, index) => (
            <div key={index} className="bg-[#f5f5f5] flex-[1_0_0] min-w-px relative">
              <div className="flex flex-col items-center size-full">
                <div className="content-stretch flex flex-col gap-[20px] items-center px-[40px] py-[32px] relative size-full">
                  <div className="[word-break:break-word] content-stretch flex flex-col font-['Gen_Interface_JP_Display:SemiBold',sans-serif] gap-[10px] items-center leading-[normal] not-italic relative shrink-0 whitespace-nowrap">
                    <p className="relative shrink-0 text-[28px]" style={{ color: accent }}>{metric.label}</p>
                    <p className="relative shrink-0 text-[#18191e] text-[58px]">{metric.value}</p>
                    <div className="flex items-baseline gap-[16px] mt-[6px]">
                      <p className="relative shrink-0 text-[20px]" style={{ color: accent }}>想定着地</p>
                      <p className="relative shrink-0 text-[#18191e] text-[40px]">{metric.projected || '---'}</p>
                    </div>
                  </div>
                  <div className="h-0 relative shrink-0 w-full">
                    <div className="absolute inset-[-1px_0_0_0]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 480 1">
                        <line stroke="#18191e" x2="480" y1="0.5" y2="0.5" />
                      </svg>
                    </div>
                  </div>
                  <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[26px] whitespace-nowrap">
                    {metric.reference}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SafeArea>
    </div>
  );
}
