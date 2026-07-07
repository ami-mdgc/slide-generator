export interface SlideTemplateData {
  [key: string]: any;
}

export interface SlideTemplate {
  id: string;
  name: string;
  component: React.ComponentType<{ data: SlideTemplateData }>;
  dataSchema: {
    [key: string]: 'string' | 'number' | 'array' | 'object';
  };
}

export interface SlideTypeDefinition {
  id: string;
  name: string;
  description: string;
  slides: {
    title: string;
    templateId: string;
    order: number;
  }[];
}

// スライドタイプの定義
export const SLIDE_TYPES: SlideTypeDefinition[] = [
  {
    id: 'monthly-meeting',
    name: '月次総会',
    description: '月次の振り返りと次月の計画を共有する総会用スライド',
    slides: [
      {
        title: '先月の振り返り',
        templateId: 'template01',
        order: 1,
      },
      {
        title: '変動要因',
        templateId: 'template02',
        order: 2,
      },
      {
        title: '今月のテーマと目標',
        templateId: 'template03',
        order: 3,
      },
      {
        title: '今月の施策',
        templateId: 'template04',
        order: 4,
      },
      {
        title: '特記事項',
        templateId: 'template05',
        order: 5,
      },
    ],
  },
  // 他のスライドタイプはここに追加
];

import TemplateCover from '../components/templates/TemplateCover';
import Template01 from '../components/templates/Template01';
import Template02 from '../components/templates/Template02';
import Template03 from '../components/templates/Template03';
import Template04 from '../components/templates/Template04';
import Template05 from '../components/templates/Template05';
import Template06 from '../components/templates/Template06';
import Template07 from '../components/templates/Template07';
import Template08 from '../components/templates/Template08';
import Template09 from '../components/templates/Template09';
import Template10 from '../components/templates/Template10';
import Template11 from '../components/templates/Template11';
import Template12 from '../components/templates/Template12';

// テンプレート定義
export const TEMPLATE_REGISTRY: Record<string, SlideTemplate> = {
  templateCover: {
    id: 'templateCover',
    name: '表紙',
    component: TemplateCover,
    dataSchema: {
      title: 'string',
      subtitle: 'string',
      date: 'string',
    },
  },
  template01: {
    id: 'template01',
    name: '先月の振り返り',
    component: Template01,
    dataSchema: {
      title: 'string',
      summaryItems: 'array',
      metrics: 'array',
    },
  },
  template02: {
    id: 'template02',
    name: '変動要因',
    component: Template02,
    dataSchema: {
      title: 'string',
      sections: 'array',
    },
  },
  template03: {
    id: 'template03',
    name: '今月のテーマと目標',
    component: Template03,
    dataSchema: {
      title: 'string',
      theme: 'object',
      metrics: 'array',
    },
  },
  template04: {
    id: 'template04',
    name: '今月の施策',
    component: Template04,
    dataSchema: {
      title: 'string',
      initiatives: 'array',
    },
  },
  template05: {
    id: 'template05',
    name: '特記事項',
    component: Template05,
    dataSchema: {
      title: 'string',
      subtitle: 'string',
      sections: 'array',
    },
  },
  template06: {
    id: 'template06',
    name: 'KPIグラフ',
    component: Template06,
    dataSchema: {
      title: 'string',
      months: 'array',
      metrics: 'array',
    },
  },
  template07: {
    id: 'template07',
    name: '振り返り＋グラフ',
    component: Template07,
    dataSchema: {
      title: 'string',
      summaryItems: 'array',
      kpis: 'array',
      months: 'array',
      chartMetrics: 'array',
    },
  },
  template08: {
    id: 'template08',
    name: '前月比較テーブル',
    component: Template08,
    dataSchema: {
      title: 'string',
      headers: 'array',
      rows: 'array',
    },
  },
  template09: {
    id: 'template09',
    name: '全社サマリーグラフ',
    component: Template09,
    dataSchema: {
      title: 'string',
      months: 'array',
      revenues: 'array',
      profits: 'array',
    },
  },
  template10: {
    id: 'template10',
    name: '各事業サマリー',
    component: Template10,
    dataSchema: {
      title: 'string',
      businesses: 'array',
    },
  },
  template11: {
    id: 'template11',
    name: '四半期推移グラフ',
    component: Template11,
    dataSchema: {
      title: 'string',
      quarters: 'array',
      chartMetrics: 'array',
    },
  },
  template12: {
    id: 'template12',
    name: '全事業四半期推移グラフ',
    component: Template12,
    dataSchema: {
      title: 'string',
      quarters: 'array',
      revenues: 'array',
      profits: 'array',
    },
  },
};
