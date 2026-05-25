import { SlideTemplateData } from "../../types/slide-template";

interface Template03Data extends SlideTemplateData {
  title: string;
  theme: {
    label: string;
    text: string;
  };
  metrics: {
    label: string;
    value: string;
    reference: string;
  }[];
}

export default function Template03({ data }: { data: Template03Data }) {
  return (
    <div className="bg-white relative size-full" data-name="template03">
      <div className="absolute content-stretch flex items-center justify-center left-[96px] top-[88px]" data-name="Heading1">
        <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[64px] whitespace-nowrap">
          {data.title}
        </p>
      </div>

      <div className="absolute bg-[#f5f5f5] content-stretch flex flex-col gap-[32px] items-center left-[96px] p-[64px] top-[219px] w-[1728px]" data-name="summary">
        <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#c4ab46] text-[36px] whitespace-nowrap">
          {data.theme.label}
        </p>
        <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Heading1">
          <div className="[word-break:break-word] font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[64px] text-center">
            {data.theme.text}
          </div>
        </div>
      </div>

      <div className="-translate-x-1/2 absolute content-stretch flex gap-[24px] items-center left-1/2 top-[605px] w-[1728px]">
        {data.metrics.map((metric, index) => (
          <div key={index} className="bg-[#f5f5f5] flex-[1_0_0] min-w-px relative">
            <div className="flex flex-col items-center size-full">
              <div className="content-stretch flex flex-col gap-[38px] items-center px-[40px] py-[48px] relative size-full">
                <div className="[word-break:break-word] content-stretch flex flex-col font-['Gen_Interface_JP_Display:SemiBold',sans-serif] gap-[16px] items-center leading-[normal] not-italic relative shrink-0 whitespace-nowrap">
                  <p className="relative shrink-0 text-[#c4ab46] text-[36px]">{metric.label}</p>
                  <p className="relative shrink-0 text-[#18191e] text-[72px]">{metric.value}</p>
                </div>
                <div className="h-0 relative shrink-0 w-full">
                  <div className="absolute inset-[-1px_0_0_0]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 480 1">
                      <line stroke="#18191e" x2="480" y1="0.5" y2="0.5" />
                    </svg>
                  </div>
                </div>
                <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[32px] whitespace-nowrap">
                  {metric.reference}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
