export type DeviceType = 'desktop' | 'mobile';

export default defineNuxtPlugin(() => {
  let device: DeviceType = 'desktop';
  const mobileRegexp =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/;
  if (mobileRegexp.test(navigator.userAgent)) {
    device = 'mobile';
  }
  return {
    provide: { device },
  }
});