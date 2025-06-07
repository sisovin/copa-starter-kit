/**
 * Analytics service for tracking user events
 */

interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

// For demo purposes, we'll store events in memory
// In a production app, this would send events to an analytics service
const events: AnalyticsEvent[] = [];

// Get a session ID (would normally be stored in a cookie or localStorage)
const getSessionId = () => {
  if (typeof window !== "undefined") {
    if (!localStorage.getItem("analytics_session_id")) {
      localStorage.setItem("analytics_session_id", `session_${Date.now()}`);
    }
    return localStorage.getItem("analytics_session_id") as string;
  }
  return `server_session_${Date.now()}`;
};

/**
 * Send an analytics event
 *
 * @param name Event name
 * @param properties Event properties
 */
export const sendAnalyticsEvent = (
  name: string,
  properties: Record<string, any> = {}
) => {
  try {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
      sessionId: getSessionId(),
    };

    // In a real app, we would send this to an analytics service
    // Example: mixpanel.track(name, properties);
    // Example: posthog.capture(name, properties);

    console.log("Analytics event:", event);
    events.push(event);

    // If you want to integrate with a real analytics service, uncomment one of these:

    // Google Analytics (GA4)
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', name, properties);
    // }

    // Segment
    // if (typeof window !== 'undefined' && window.analytics) {
    //   window.analytics.track(name, properties);
    // }

    return true;
  } catch (error) {
    console.error("Failed to send analytics event:", error);
    return false;
  }
};

/**
 * Get all captured events (for debugging)
 */
export const getEvents = () => {
  return events;
};
