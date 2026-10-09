(() => {
  const form = document.querySelector("#patient-inquiry-form");
  if (!form) return;

  const language = document.documentElement.lang === "es" ? "es" : "en";
  const fields = Object.fromEntries([...form.elements].filter((item) => item.name).map((item) => [item.name, item]));
  const errorSummary = document.querySelector("#error-summary");
  const errorList = document.querySelector("#error-summary-list");
  const successNotice = document.querySelector("#form-notice");
  const insuranceFields = document.querySelector("#insurance-fields");
  const patientIdField = document.querySelector("#patient-id-field");
  const eveningWarning = document.querySelector("#evening-warning");
  const concernCount = document.querySelector("#character-count");

  const messages = {
    en: {
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
      errors: "Please correct the following fields:",
      chars: "{count} / 500 characters",
      evening: "Evening availability is limited. This clinic may close before 8pm; reception will confirm availability.",
      successTitle: "Thank you for contacting HealthCore.",
      success: "We have received your inquiry. A member of our reception team will contact you within 1 business day to confirm appointment details and answer any questions.",
      urgent: "If you need urgent assistance, call your preferred clinic directly using the numbers listed on our website.",
      closing: "We look forward to caring for you.",
    },
    es: {
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
      errors: "Corrige los siguientes campos:",
      chars: "{count} / 500 caracteres",
      evening: "La disponibilidad por la noche es limitada. Esta clínica podría cerrar antes de las 8pm; recepción confirmará la disponibilidad.",
      successTitle: "Gracias por contactar a HealthCore.",
      success: "Hemos recibido tu consulta. Un miembro de nuestro equipo de recepción se pondrá en contacto contigo dentro de 1 día hábil para confirmar los detalles de tu cita y responder cualquier pregunta.",
      urgent: "Si necesitas asistencia urgente, llama directamente a tu clínica preferida usando los números listados en nuestro sitio web.",
      closing: "Esperamos poder atenderte pronto.",
    },
  }[language];

  const fieldErrors = {
    first_name: "first-name-error",
    last_name: "last-name-error",
    date_of_birth: "date-of-birth-error",
    email: "email-error",
    phone: "phone-error",
    preferred_language: "preferred-language-error",
    preferred_clinic: "preferred-clinic-error",
    preferred_date: "preferred-date-error",
    preferred_time: "preferred-time-error",
    service_type: "service-type-error",
    new_patient: "new-patient-error",
    has_insurance: "has-insurance-error",
    insurance_provider: "insurance-provider-error",
    insurance_member_id: "insurance-member-id-error",
    health_concern: "health-concern-error",
    contact_consent: "contact-consent-error",
    patient_id: "patient-id-error",
  };

  const firstControl = (name) => form.querySelector(`[name="${name}"]`);
  const value = (name) => firstControl(name)?.value.trim() ?? "";
  const checkedValue = (name) => form.querySelector(`[name="${name}"]:checked`)?.value ?? "";
  const textError = (name) => document.getElementById(fieldErrors[name]);
  const setError = (name, message) => {
    const error = textError(name);
    if (error) error.textContent = message;
    for (const control of form.querySelectorAll(`[name="${name}"]`)) {
      if (message) control.setAttribute("aria-invalid", "true");
      else control.removeAttribute("aria-invalid");
    }
  };
  const clearErrors = () => Object.keys(fieldErrors).forEach((name) => setError(name, ""));
  const getError = (name) => {
    const raw = value(name);
    if (["new_patient", "has_insurance"].includes(name)) {
      return checkedValue(name) ? "" : messages[name];
    }
    if (name === "contact_consent") return fields.contact_consent.checked ? "" : messages.contact_consent;
    if (name === "insurance_provider") return checkedValue("has_insurance") === "yes" && !raw ? messages.insurance_provider : "";
    if (name === "insurance_member_id") {
      if (checkedValue("has_insurance") !== "yes" && !raw) return "";
      return /^[A-Za-z0-9]{6,20}$/.test(raw) ? "" : messages.insurance_member_id;
    }
    if (name === "patient_id") return raw && !/^HC-[A-Za-z0-9]{6}$/.test(raw) ? messages.patient_id : "";
    if (name === "first_name" || name === "last_name") {
      return /^[\p{L}]{2,50}$/u.test(raw) ? "" : messages[name];
    }
    if (name === "date_of_birth") {
      if (!raw) return messages.date_of_birth;
      const birth = new Date(`${raw}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const cutoff = new Date(today);
      cutoff.setFullYear(cutoff.getFullYear() - 120);
      return Number.isNaN(birth.getTime()) || birth > today || birth < cutoff ? messages.date_of_birth : "";
    }
    if (name === "email") return fields.email.validity.valid ? "" : messages.email;
    if (name === "phone") return /^\+\d{1,3}(?:[ .()-]*\d){6,14}$/.test(raw) ? "" : messages.phone;
    if (["preferred_language", "preferred_clinic", "preferred_time", "service_type"].includes(name)) return raw ? "" : messages[name];
    if (name === "preferred_date") return isPreferredDateValid(raw) ? "" : messages.preferred_date;
    if (name === "health_concern") {
      const count = fields.health_concern.value.trim().length;
      return count >= 20 ? "" : messages.health_concern.replace("{remaining}", String(20 - count));
    }
    return "";
  };

  const isoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const addCalendarDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };
  const isPreferredDateValid = (raw) => {
    if (!raw) return false;
    const selected = new Date(`${raw}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const latest = addCalendarDays(today, 60);
    if (Number.isNaN(selected.getTime()) || selected <= today || selected > latest) return false;
    let businessDays = 0;
    const cursor = new Date(today);
    while (cursor < selected) {
      cursor.setDate(cursor.getDate() + 1);
      if (cursor.getDay() !== 0 && cursor.getDay() !== 6) businessDays += 1;
    }
    return businessDays >= 1 && selected.getDay() !== 0 && selected.getDay() !== 6;
  };

  const updateDateLimits = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    fields.date_of_birth.max = isoDate(today);
    const oldest = new Date(today);
    oldest.setFullYear(oldest.getFullYear() - 120);
    fields.date_of_birth.min = isoDate(oldest);
    fields.preferred_date.min = isoDate(addCalendarDays(today, 1));
    fields.preferred_date.max = isoDate(addCalendarDays(today, 60));
  };

  const syncConditionalFields = () => {
    const insured = checkedValue("has_insurance") === "yes";
    insuranceFields.hidden = !insured;
    fields.insurance_provider.required = insured;
    fields.insurance_member_id.required = insured;
    if (!insured) {
      fields.insurance_provider.value = "";
      fields.insurance_member_id.value = "";
      setError("insurance_provider", "");
      setError("insurance_member_id", "");
    }

    const returning = checkedValue("new_patient") === "no";
    patientIdField.hidden = !returning;
    if (!returning) {
      fields.patient_id.value = "";
      setError("patient_id", "");
    }
  };

  const updateEveningWarning = () => {
    const clinic = value("preferred_clinic");
    const evening = value("preferred_time") === "evening";
    const closesBeforeEight = ["HealthCore San Antonio", "HealthCore Austin North", "HealthCore Atlanta"].includes(clinic);
    eveningWarning.hidden = !(evening && closesBeforeEight);
  };

  const updateCharacterCount = () => {
    concernCount.textContent = messages.chars.replace("{count}", String(fields.health_concern.value.length));
  };

  const validateAll = () => {
    clearErrors();
    const names = Object.keys(fieldErrors);
    if (value("service_type") === "paediatric_care") {
      const dobError = getError("date_of_birth");
      if (!dobError) {
        const birth = new Date(`${value("date_of_birth")}T00:00:00`);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
        if (beforeBirthday) age -= 1;
        if (age >= 18) setError("service_type", messages.paediatric);
      }
    }
    for (const name of names) {
      if (name === "service_type" && textError(name).textContent) continue;
      setError(name, getError(name));
    }
    return names.filter((name) => textError(name).textContent);
  };

  const showErrorSummary = (invalidNames) => {
    errorList.replaceChildren();
    const labels = new Map([...form.querySelectorAll("label[for]")].map((label) => [label.htmlFor, label.textContent.replace("*", "").trim()]));
    for (const name of invalidNames) {
      const control = firstControl(name);
      const label = labels.get(control?.id) || (language === "es" ? "Campo requerido" : "Required field");
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${control?.id || name}`;
      link.textContent = `${label}: ${textError(name).textContent}`;
      item.append(link);
      errorList.append(item);
    }
    errorSummary.hidden = invalidNames.length === 0;
    if (invalidNames.length) {
      document.querySelector("#error-summary-title").textContent = messages.errors;
      errorSummary.focus();
    }
  };

  const successCopy = () => {
    const title = document.createElement("h2");
    title.textContent = messages.successTitle;
    successNotice.replaceChildren(title);
    for (const text of [messages.success, messages.urgent, messages.closing]) {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      successNotice.append(paragraph);
    }
    successNotice.hidden = false;
    form.hidden = true;
    document.querySelector(".partnership-note").hidden = true;
    successNotice.focus();
  };

  updateDateLimits();
  syncConditionalFields();
  updateCharacterCount();
  form.addEventListener("change", (event) => {
    if (event.target.name === "has_insurance" || event.target.name === "new_patient") syncConditionalFields();
    if (["preferred_clinic", "preferred_time"].includes(event.target.name)) updateEveningWarning();
    if (fieldErrors[event.target.name]) setError(event.target.name, getError(event.target.name));
    if (event.target.name === "service_type" && value("service_type") !== "paediatric_care") setError("service_type", "");
    if (event.target.name === "date_of_birth" && value("service_type") === "paediatric_care") validateAll();
  });
  form.addEventListener("input", (event) => {
    if (event.target.name === "health_concern") {
      updateCharacterCount();
      if (textError("health_concern").textContent) setError("health_concern", getError("health_concern"));
    } else if (fieldErrors[event.target.name] && textError(event.target.name)?.textContent) {
      setError(event.target.name, getError(event.target.name));
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorSummary.hidden = true;
    const invalidNames = validateAll();
    showErrorSummary(invalidNames);
    if (!invalidNames.length) successCopy();
  });
})();
