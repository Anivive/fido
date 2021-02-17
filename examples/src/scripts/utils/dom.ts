import MobileDetect from 'mobile-detect';

export const device = new MobileDetect(window.navigator.userAgent);
export const isMobile = device.phone() !== null;
export const isTablet = device.tablet() !== null;
export const isiPad = /iPad/i.test(navigator.userAgent);
export const isiPhone = /iPhone/i.test(navigator.userAgent);
export const isiOS = isiPad || isiPhone;

export async function delay(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    let timer: any = setTimeout(() => {
      clearTimeout(timer);
      timer = undefined;
      try {
        resolve();
      } catch (err) {
        // an error has occurred
      }
    }, seconds * 1000);
  });
}
