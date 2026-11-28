// Consultation request: builds a pre-filled email from the form. Nothing is sent by the site.
(() => {
  const form = document.querySelector('[data-consult]');
  if (!form) return;
  const note = form.querySelector('[data-note]');
  const label = (id) => (form.querySelector(`label[for="${id}"]`) || {}).textContent || id;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const firm = form.firm.value.trim();
    const site = form.site.value.trim();
    const industry = form.industry.value;
    const subject = `${form.dataset.subject}: ${firm}`;
    const body = [
      `${label('firm')}: ${firm}`,
      `${label('site')}: ${site}`,
      `${label('industry')}: ${industry}`,
      '',
    ].join('\n');
    window.location.href =
      `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = form.dataset.opened;
    note.classList.add('done');
  });
})();
