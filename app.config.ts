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
    type: 'danger',
    title: '关于 Fanbook 对于机器人消息管制的通知',
    link: 'https://github.com/Starlight-Dev-Team/fanbook-bot-tools/discussions/69',
  }],
};

export default defineAppConfig(config);
