export type AnnouncementType =
  | 'info'
  | 'danger';

export interface Announcement {
  type: AnnouncementType;
  title: string;
  link: string;
}

interface AppConfig {
  announcements: Announcement[];
}

declare module 'nuxt/schema' {
  type AppConfigInput = AppConfig;
}

const config: AppConfig = {
  announcements: [{
    type: 'info',
    title: '欢迎加入机器人工具 Fanbook 服务器',
    link: 'https://fanbook.mobi/rjCNRFUN',
  }],
};

export default defineAppConfig(config);
