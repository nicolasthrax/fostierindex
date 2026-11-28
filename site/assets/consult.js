// Consultation request: builds a pre-filled email from the form. Nothing is sent by the site.
// Tries the visitor's email app first; if none is set up, Gmail, Outlook and copy work in any browser.
(() => {
  const form = document.querySelector('[data-consult]');
  if (!form) return;
  const note = form.querySelector('[data-note]');
  const fallback = form.querySelector('[data-fallback]');
  const gmail = form.querySelector('[data-gmail]');
  const outlook = form.querySelector('[data-outlook]');
  const copy = form.querySelector('[data-copy]');
  const copyLabel = copy ? copy.textContent : '';
  const label = (id) => (form.querySelector(`label[for="${id}"]`) || {}).textContent || id;
  const enc = encodeURIComponent;
  let message = null;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const to = form.dataset.email;
    const firm = form.firm.value.trim();
    const subject = `${form.dataset.subject}: ${firm}`;
    const body = [
      `${label('firm')}: ${firm}`,
      `${label('site')}: ${form.site.value.trim()}`,
      `${label('industry')}: ${form.industry.value}`,
      '',
    ].join('\n');
    message = { to, subject, body };

    gmail.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(to)}&su=${enc(subject)}&body=${enc(body)}`;
    outlook.href = `https://outlook.office.com/mail/deeplink/compose?to=${enc(to)}&subject=${enc(subject)}&body=${enc(body)}`;
    if (copy) copy.textContent = copyLabel;

    // A link click opens the mail app more reliably than changing location.
    const a = document.createElement('a');
    a.href = `mailto:${to}?subject=${enc(subject)}&body=${enc(body)}`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();

    note.textContent = form.dataset.opened;
    note.classList.add('done');
    fallback.hidden = false;
  });

  if (copy) {
    copy.addEventListener('click', async () => {
      if (!message) return;
      const text = `To: ${message.to}\nSubject: ${message.subject}\n\n${message.body}`;
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        const t = document.createElement('textarea');
        t.value = text;
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        t.remove();
      }
      copy.textContent = copy.dataset.copied;
      note.textContent = copy.dataset.copiedNote;
    });
  }
})();
