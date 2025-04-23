import { useEffect } from 'react';

type Props = {
  eventUrl: string;
};

export default function PretalxScheduleWidget({ eventUrl }: Props) {
  console.log("[PretalxScheduleWidget] mounted with eventUrl:", eventUrl);

  useEffect(() => {
    const scriptSrc = `${eventUrl.replace(/\/$/, '')}/widgets/schedule.js`;
    console.log("[PretalxScheduleWidget] injecting script:", scriptSrc);

    if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      document.head.appendChild(script);
    } else {
      console.log("[PretalxScheduleWidget] script already injected");
    }
  }, [eventUrl]);

  return null;
}
