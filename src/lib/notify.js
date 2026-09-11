
const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';
const SESSION_SENT_KEY = 'kamal-portfolio-email-sent';

function readableEvent(e) {
  const p = e.payload || {};
  if (e.event === 'project_open') return `Opened project: ${p.project}`;
  if (e.event === 'project_link_click') return `Clicked ${p.link} link on: ${p.project}`;
  if (e.event === 'resume_download_click' || e.event === 'resume_download') return 'Downloaded / opened the resume';
  if (e.event === 'map_node_open') return `Opened panel: ${p.node}`;
  if (e.event === 'game_open') return `Opened game: ${p.game}`;
  if (e.event === 'skill_open') return `Inspected skill: ${p.skill}`;
  return e.event;
}

export async function sendSessionEmail(triggerEvent, sessionEvents = []) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) return; 

  try {
    if (sessionStorage.getItem(SESSION_SENT_KEY)) return; 
    sessionStorage.setItem(SESSION_SENT_KEY, '1');
  } catch (_) { /* ignore */ }

  const summary = sessionEvents.length
    ? sessionEvents.map(readableEvent).join('\n')
    : readableEvent(triggerEvent);

  const body = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      headline: readableEvent(triggerEvent),
      visitor_summary: summary,
      page: location.pathname,
      time: new Date().toLocaleString(),
    },
  };

  try {
    await fetch(EMAILJS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (_) { /* fail silently — never break the site over an email */ }
}
