(() => {
  const form = document.querySelector("#patient-inquiry-form");
  if (!form) return;

  const language = document.documentElement.lang === "es" ? "es" : "en";
  const controls = [...form.querySelectorAll("input, select, textarea")];
  const field = (name) => controls.find((control) => control.name === name);
  const fieldErrorIds = {
    first_name: "first-name-error", last_name: "last-name-error", date_of_birth: "date-of-birth-error",
    email: "email-error", phone: "phone-error", preferred_language: "preferred-language-error",
    preferred_clinic: "preferred-clinic-error", preferred_date: "preferred-date-error",
    preferred_time: "preferred-time-error", service_type: "service-type-error", new_patient: "new-patient-error",
    has_insurance: "has-insurance-error", insurance_provider: "insurance-provider-error",
    insurance_member_id: "insurance-member-id-error", health_concern: "health-concern-error",
    contact_consent: "contact-consent-error", patient_id: "patient-id-error",
  };
  const copy = {
    en: {
      errors: "Please review the following fields:",
      first_name: "Enter a first name using letters only (2–50 characters).",
      last_name: "Enter a last name using letters only (2–50 characters).",
      date_of_birth: "Enter a valid date of birth. The patient must be between 0 and 120 years old.",
      email: "Enter a valid email address (example: name@provider.com).",
      phone: "The phone number must include a country calling code (example: +1 305 555 0191).",
      preferred_language: "Select your preferred language.",
      preferred_clinic: "Select the clinic you would like to visit.",
      preferred_date: "Select a date at least 1 business day from today and no more than 60 days ahead.",
      preferred_time: "Select your preferred time.",
      service_type: "Select the type of care you are looking for.",
      paediatric: "Paediatric Care is available for patients under 18. Check the date of birth or select a different service.",
      new_patient: "Tell us whether this is your first visit to HealthCore.",
      has_insurance: "Tell us whether you have health insurance.",
      insurance_provider: "Enter the name of your insurance provider.",
      insurance_member_id: "The member ID must be 6–20 letters or numbers.",
      health_concern: "Describe your health concern in at least 20 characters ({remaining} more needed).",
      contact_consent: "You must consent to being contacted before submitting this form.",
      patient_id: "Enter a Patient ID in the format HC- followed by 6 letters or numbers.",
      evening: "Evening availability is limited. This clinic may close before 8pm; reception will confirm availability.",
      count: "{count} / 500 characters",
      successTitle: "Thank you for contacting HealthCore.",
      success: "We have received your inquiry. A member of our reception team will contact you within 1 business day to confirm appointment details and answer any questions.",
      urgent: "If you need urgent assistance, call your preferred clinic directly using the numbers listed on our website.",
      closing: "We look forward to caring for you.",
    },
    es: {
      errors: "Corrige los siguientes campos:",
      first_name: "El nombre debe contener solo letras y tener al menos 2 caracteres",
      last_name: "El apellido debe contener solo letras y tener al menos 2 caracteres",
      date_of_birth: "Ingresa una fecha de nacimiento válida. El paciente debe tener entre 0 y 120 años",
      email: "Ingresa un correo electrónico válido (ejemplo: nombre@proveedor.com)",
      phone: "El teléfono debe incluir un código de país (ejemplo: +1 305 555 0191)",
      preferred_language: "Selecciona tu idioma preferido",
      preferred_clinic: "Selecciona la clínica que te gustaría visitar",
      preferred_date: "Selecciona una fecha de al menos 1 día hábil desde hoy y no más de 60 días hacia adelante",
      preferred_time: "Selecciona tu franja horaria preferida",
      service_type: "Selecciona el tipo de atención que estás buscando",
      paediatric: "La atención pediátrica está disponible para pacientes menores de 18 años. Revisa la fecha de nacimiento o selecciona otro servicio.",
      new_patient: "Indica si esta es tu primera visita a HealthCore",
      has_insurance: "Indica si tienes seguro médico",
      insurance_provider: "Ingresa el nombre de tu aseguradora",
      insurance_member_id: "El ID de afiliado debe tener entre 6 y 20 caracteres alfanuméricos",
      health_concern: "Describe tu consulta médica en al menos 20 caracteres (faltan {remaining} caracteres)",
      contact_consent: "Debes dar tu consentimiento para ser contactado antes de enviar este formulario",
      patient_id: "Ingresa un ID de paciente con el formato HC- seguido de 6 letras o números.",
      evening: "La disponibilidad por la noche es limitada. Esta clínica podría cerrar antes de las 8pm; recepción confirmará la disponibilidad.",
      count: "{count} / 500 caracteres",
      successTitle: "Gracias por contactar a HealthCore.",
      success: "Hemos recibido tu consulta. Un miembro de nuestro equipo de recepción se pondrá en contacto contigo dentro de 1 día hábil para confirmar los detalles de tu cita y responder cualquier pregunta.",
      urgent: "Si necesitas asistencia urgente, llama directamente a tu clínica preferida usando los números listados en nuestro sitio web.",
      closing: "Esperamos poder atenderte pronto.",
    },
  }[language];

  const errorNode = (name) => document.getElementById(fieldErrorIds[name]);
  const first = (name) => controls.find((control) => control.name === name);
  const value = (name) => (first(name)?.value ?? "").trim();
  const checked = (name) => form.querySelector(`[name="${name}"]:checked`)?.value ?? "";
  const setError = (name, message) => {
    errorNode(name).textContent = message;
    for (const control of controls.filter((item) => item.name === name)) {
      if (message) control.setAttribute("aria-invalid", "true");
      else control.removeAttribute("aria-invalid");
    }
  };
  const clearErrors = () => Object.keys(fieldErrorIds).forEach((name) => setError(name, ""));

  const dateFromIso = (iso) => {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year, month - 1, day);
  };
  const isoDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };
  const todayLocal = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const preferredDateIsValid = (iso) => {
    if (!iso) return false;
    const date = dateFromIso(iso);
    const today = todayLocal();
    if (Number.isNaN(date.getTime()) || date <= today || date > addDays(today, 60)) return false;
    let businessDays = 0;
    for (let cursor = addDays(today, 1); cursor <= date; cursor = addDays(cursor, 1)) {
      if (![0, 6].includes(cursor.getDay())) businessDays += 1;
    }
    return businessDays >= 1;
  };
  const ageAtDate = (birth, reference) => {
    let age = reference.getFullYear() - birth.getFullYear();
    if (reference.getMonth() < birth.getMonth() || (reference.getMonth() === birth.getMonth() && reference.getDate() < birth.getDate())) age -= 1;
    return age;
  };

  const getError = (name) => {
    const raw = value(name);
    if (name === "new_patient" || name === "has_insurance") return checked(name) ? "" : copy[name];
    if (name === "contact_consent") return field(name).checked ? "" : copy.contact_consent;
    if (name === "insurance_provider") return checked("has_insurance") === "yes" && !raw ? copy.insurance_provider : "";
    if (name === "insurance_member_id") {
      if (checked("has_insurance") !== "yes" && !raw) return "";
      return /^[A-Za-z0-9]{6,20}$/.test(raw) ? "" : copy.insurance_member_id;
    }
    if (name === "patient_id") return raw && !/^HC-[A-Za-z0-9]{6}$/.test(raw) ? copy.patient_id : "";
    if (name === "first_name" || name === "last_name") return /^[\p{L}]{2,50}$/u.test(raw) ? "" : copy[name];
    if (name === "date_of_birth") {
      if (!raw) return copy.date_of_birth;
      const birth = dateFromIso(raw);
      const age = ageAtDate(birth, todayLocal());
      return Number.isNaN(birth.getTime()) || age < 0 || age > 120 ? copy.date_of_birth : "";
    }
    if (name === "email") return field("email").validity.valid ? "" : copy.email;
    if (name === "phone") return /^\+\d{1,3}(?:[ .()-]*\d){6,14}$/.test(raw) ? "" : copy.phone;
    if (["preferred_language", "preferred_clinic", "preferred_time", "service_type"].includes(name)) return raw ? "" : copy[name];
    if (name === "preferred_date") return preferredDateIsValid(raw) ? "" : copy.preferred_date;
    if (name === "health_concern") {
      const length = field(name).value.trim().length;
      return length >= 20 ? "" : copy.health_concern.replace("{remaining}", String(20 - length));
    }
    return "";
  };

  const syncConditionalFields = () => {
    const insured = checked("has_insurance") === "yes";
    document.querySelector("#insurance-fields").hidden = !insured;
    field("insurance_provider").required = insured;
    field("insurance_member_id").required = insured;
    if (!insured) {
      field("insurance_provider").value = "";
      field("insurance_member_id").value = "";
      setError("insurance_provider", "");
      setError("insurance_member_id", "");
    }
    const returning = checked("new_patient") === "no";
    document.querySelector("#patient-id-field").hidden = !returning;
    if (!returning) {
      field("patient_id").value = "";
      setError("patient_id", "");
    }
  };

  const updateEveningWarning = () => {
    const clinic = value("preferred_clinic");
    const selectedEvening = value("preferred_time") === "evening";
    const limitedClinics = ["HealthCore San Antonio", "HealthCore Austin North", "HealthCore Orlando", "HealthCore Atlanta"];
    const warning = document.querySelector("#evening-warning");
    warning.textContent = copy.evening;
    warning.hidden = !(selectedEvening && limitedClinics.includes(clinic));
  };
  const updateCharacterCount = () => {
    document.querySelector("#character-count").textContent = copy.count.replace("{count}", String(field("health_concern").value.trim().length));
  };

  const validateAll = () => {
    clearErrors();
    const names = Object.keys(fieldErrorIds);
    for (const name of names) setError(name, getError(name));
    if (value("service_type") === "paediatric_care" && !errorNode("date_of_birth").textContent) {
      const age = ageAtDate(dateFromIso(value("date_of_birth")), todayLocal());
      if (age >= 18) setError("service_type", copy.paediatric);
    }
    return names.filter((name) => errorNode(name).textContent);
  };

  const showErrorSummary = (invalidNames) => {
    const summary = document.querySelector("#error-summary");
    const list = document.querySelector("#error-summary-list");
    list.replaceChildren();
    for (const name of invalidNames) {
      const control = first(name);
      const label = control?.closest("[data-form-field]")?.querySelector("label")?.textContent.replace("*", "").trim()
        || control?.closest("[data-choice-group]")?.querySelector(":scope > legend")?.textContent.replace("*", "").trim()
        || (language === "es" ? "Campo" : "Field");
      const item = document.createElement("li");
      const link = document.createElement("a");
      const target = control.id || control.closest("fieldset")?.querySelector("input")?.id;
      link.href = `#${target}`;
      link.textContent = `${label}: ${errorNode(name).textContent}`;
      link.className = "text-[#6e1420] underline underline-offset-2";
      item.append(link);
      list.append(item);
    }
    summary.hidden = invalidNames.length === 0;
    if (invalidNames.length) {
      document.querySelector("#error-summary-title").textContent = copy.errors;
      summary.focus();
    }
  };

  const showSuccess = () => {
    const notice = document.querySelector("#form-notice");
    const title = document.createElement("h2");
    title.textContent = copy.successTitle;
    notice.replaceChildren(title);
    for (const text of [copy.success, copy.urgent, copy.closing]) {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      notice.append(paragraph);
    }
    notice.hidden = false;
    form.hidden = true;
    document.querySelector("[data-partnership-note]").hidden = true;
    notice.focus();
  };

  const today = todayLocal();
  const oldestBirth = new Date(today);
  oldestBirth.setFullYear(oldestBirth.getFullYear() - 120);
  field("date_of_birth").max = isoDate(today);
  field("date_of_birth").min = isoDate(oldestBirth);
  field("preferred_date").min = isoDate(addDays(today, 1));
  field("preferred_date").max = isoDate(addDays(today, 60));
  syncConditionalFields();
  updateCharacterCount();
  updateEveningWarning();

  form.addEventListener("change", (event) => {
    if (["has_insurance", "new_patient"].includes(event.target.name)) syncConditionalFields();
    if (["preferred_clinic", "preferred_time"].includes(event.target.name)) updateEveningWarning();
    if (fieldErrorIds[event.target.name] && errorNode(event.target.name).textContent) setError(event.target.name, getError(event.target.name));
    if (["service_type", "date_of_birth"].includes(event.target.name) && value("service_type") === "paediatric_care") {
      const birthError = getError("date_of_birth");
      if (!birthError && ageAtDate(dateFromIso(value("date_of_birth")), todayLocal()) >= 18) setError("service_type", copy.paediatric);
      else if (event.target.name === "service_type") setError("service_type", "");
    }
  });
  form.addEventListener("input", (event) => {
    if (event.target.name === "health_concern") updateCharacterCount();
    const name = event.target.name;
    if (fieldErrorIds[name] && errorNode(name)?.textContent) setError(name, getError(name));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const invalid = validateAll();
    showErrorSummary(invalid);
    if (invalid.length === 0) showSuccess();
  });
})();
