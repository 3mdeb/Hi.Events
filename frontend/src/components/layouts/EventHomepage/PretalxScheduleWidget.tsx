import React, { useEffect } from 'react';

type Props = {
  eventUrl: string;
  locale?: string;
  format?: string;
  style?: string;
  // Allow any other attributes to be passed through
  [key: string]: any;
};

/**
 * Converts a CSS style string into a React CSSProperties object.
 * Handles simple cases and CSS custom properties.
 * Example: "color: red; --my-var: blue" -> { color: "red", "--my-var": "blue" }
 */
function stringToCssObject(styleString: string | undefined | null): React.CSSProperties {
  if (!styleString || typeof styleString !== 'string') {
    return {};
  }
  const style: React.CSSProperties = {};
  styleString.split(';').forEach((declaration) => {
    const [property, value] = declaration.split(':');
    if (property && value) {
      const propTrimmed = property.trim();
      // For custom properties (starting with --), use as is.
      // For standard properties, React expects camelCase (e.g., marginRight).
      // This simple parser assumes properties are either custom or already camelCased if standard.
      (style as any)[propTrimmed] = value.trim();
    }
  });
  return style;
}

export default function PretalxScheduleWidget(props: Props) {
  // Destructure known props, keep the rest for spreading
  const { eventUrl, locale, format, style: styleStringFromProps, ...restAttribs } = props;

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

  // Render the actual <pretalx-schedule> tag
  // The external Pretalx script will find this tag and inject the schedule into it.
  // For custom elements, React will pass attributes through.
  const finalProps: React.HTMLAttributes<HTMLElement> & { [key: string]: any } = {
    'event-url': eventUrl,
    locale: locale,
    format: format,
    ...restAttribs,
  };

  if (styleStringFromProps) {
    finalProps.style = stringToCssObject(styleStringFromProps);
  }
  return (
    <pretalx-schedule {...finalProps}></pretalx-schedule>
  );
}
