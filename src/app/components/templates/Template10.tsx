import { SlideTemplateData } from "../../types/slide-template";
import { SafeArea } from "./SlideLayout";

interface BusinessComment {
  name: string;
  comment: string;
  color: string;
}

interface Template10Data extends SlideTemplateData {
  title: string;
  businesses: BusinessComment[];
}

export default function Template10({ data }: { data: Template10Data }) {
  const businesses = data.businesses || [];

  return (
    <div className="bg-white relative size-full" data-name="template10">
      <SafeArea>
        {/* Title */}
        <div className="absolute content-stretch flex items-center justify-center left-0 top-0">
          <p className="[word-break:break-word] font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18191e] text-[64px] whitespace-nowrap">
            {data.title}
          </p>
        </div>

        {/* Business list */}
        <div
          className="absolute left-0 top-[125px] right-0 bottom-0 flex flex-col"
          style={{ borderTop: '1px solid #e5e7eb' }}
        >
          {businesses.map((biz, i) => (
            <div
              key={i}
              className="flex-1 flex items-center"
              style={{ borderBottom: '1px solid #e5e7eb' }}
            >
              {/* Left color bar */}
              <div style={{ width: 6, backgroundColor: biz.color, alignSelf: 'stretch', flexShrink: 0 }} />

              {/* Name + comment */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 40, paddingLeft: 28, paddingRight: 28, flex: 1, minWidth: 0 }}>
                <span style={{
                  fontSize: 28,
                  color: biz.color,
                  fontFamily: 'Gen Interface JP Display:SemiBold, sans-serif',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minWidth: 300,
                }}>
                  {biz.name}
                </span>
                <span style={{
                  fontSize: 32,
                  color: '#18191e',
                  fontFamily: 'Gen Interface JP Display:Regular, sans-serif',
                  lineHeight: 1.4,
                }}>
                  {biz.comment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SafeArea>
    </div>
  );
}
