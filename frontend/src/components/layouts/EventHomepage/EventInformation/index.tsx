import {IconCalendar, IconExternalLink, IconMapPin} from "@tabler/icons-react";
import classes from "./EventInformation.module.scss";
import {formatAddress} from "../../../../utilites/formatAddress.tsx";
import {t} from "@lingui/macro";
import {Button} from "@mantine/core";
import {LoadingMask} from "../../../common/LoadingMask";
import {ShareComponent} from "../../../common/ShareIcon";
import {eventCoverImageUrl, eventHomepageUrl} from "../../../../utilites/urlHelper.ts";
import {FC} from "react";
import parse, {DOMNode, Element, HTMLReactParserOptions} from 'html-react-parser';
import {Event} from "../../../../types.ts";
import {EventDateRange} from "../../../common/EventDateRange";
import PretalxScheduleWidget from "../PretalxScheduleWidget.tsx";

// Helper function to decode HTML entities
function decodeHtmlEntities(html: string): string {
  if (typeof document === 'undefined') {
    // Basic SSR fallback or use a dedicated library for SSR
    // This is a simplified version and might not cover all edge cases.
    return html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'") // Apostrophe
      .replace(/&nbsp;/g, '\u00A0'); // Non-breaking space
  }
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
}

export const EventInformation: FC<{
    event: Event
}> = ({event}) => {
    if (!event) {
        return <LoadingMask/>;
    }

    const parserOptions: HTMLReactParserOptions = {
        replace: (domNode) => {
            if (domNode instanceof Element && domNode.attribs) {
                if (!domNode.name) {
                    // Element without a name, parser should handle it or skip.
                    return undefined;
                }
                if (domNode.name === 'pretalx-schedule') {
                    const {
                        'event-url': eventUrlAttr, // attribute names are lowercased by the parser
                        locale: localeAttr,
                        format: formatAttr,
                        style: styleAttr,
                        ...otherAttribs // Capture any other attributes
                    } = domNode.attribs;

                    if (eventUrlAttr) {
                        return (
                            <PretalxScheduleWidget
                                eventUrl={eventUrlAttr}
                                locale={localeAttr}
                                format={formatAttr}
                                style={styleAttr}
                                {...otherAttribs} // Pass through other attributes
                            />
                        );
                    }
                    // Optionally, log a warning if a pretalx-schedule tag is found without an event-url
                }
            }
            // Return undefined for the parser to handle default rendering if no replacement occurs
            return undefined;
        },
    };

    const rawDescription = event?.description || '';

    // Decode the description before parsing
    const decodedDescription = decodeHtmlEntities(rawDescription);

    let parsedDescriptionContent = null;
    try {
        if (typeof decodedDescription === 'string') {
            parsedDescriptionContent = parse(decodedDescription, parserOptions);
        } else {
            console.error("[EventInformation] decodedDescription is not a string and cannot be parsed:", decodedDescription);
        }
    } catch (error) {
        console.error("[EventInformation] Server side parser error:", error);
    }

    return (
        <>
            <div className={classes.preHeading}>
                <div className={classes.organizer}>
                    {event.organizer?.name}
                </div>
                <div className={classes.shareButtons}>
                    <ShareComponent
                        title={'Check out this event: ' + event.title}
                        text={'Check out this event: ' + event.title}
                        url={eventHomepageUrl(event)}
                        imageUrl={eventCoverImageUrl(event)}
                    />
                </div>
            </div>
            <h1 className={classes.eventTitle}>{event.title}</h1>
            <div className={classes.eventInfo}>
                <div className={classes.eventDetail}>
                    <div className={classes.details}>
                        <IconCalendar size={20}/>
                        <div>
                            <EventDateRange event={event}/>
                        </div>
                    </div>
                </div>

                {event.settings?.location_details && (
                    <div className={classes.eventDetail}>
                        <div className={classes.details}>
                            <IconMapPin size={20}/>
                            <div className={classes.detail}>
                                <b>{event.settings?.location_details?.venue_name}</b>
                                <div>{formatAddress(event.settings?.location_details)}</div>
                                <div>
                                    <Button
                                        className={classes.viewOnGoogleMaps}
                                        component="a"
                                        target="_blank"
                                        href={
                                            event.settings.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(event?.settings?.location_details))}`}
                                        variant="transparent"
                                        size="xs"
                                        rightSection={<IconExternalLink size={15}/>}
                                    >
                                        {event.settings.maps_url ? t`View map` : t`View on Google Maps`}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {event?.description && (
                <div className={classes.eventDescription}>
                    <h2>{t`About`}</h2>
                    {/* Use html-react-parser to render the description */}
                    {parsedDescriptionContent}
                </div>
            )}
        </>
    )
}
