export type DeviceType = 'desktop' | 'mobile';

export default defineNuxtPlugin(() => {
  const device: DeviceType = (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/
  ).test(navigator.userAgent)
    ? 'mobile'
    : 'desktop';
  document.body.classList.add(device);
  return {
    provide: { device },
  };
});
