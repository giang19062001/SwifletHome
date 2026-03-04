// Clear error messages
const clearErrors = () => {
  document.querySelectorAll('.error-message').forEach((el) => {
    el.textContent = '';
    el.style.display = 'none';
  });
};

// Display error messages
const displayErrors = (errors) => {
  clearErrors();
  if (errors) {
    Object.keys(errors).forEach((field) => {
      const errorElement = document.querySelector(`[data-error="${field}"]`);
      if (errorElement) {
        errorElement.textContent = errors[field][0];
        errorElement.style.display = 'block';
      }
    });
  }
};

// show or hide errors
const checkingErrors = (formData, constraints) => {
  let errors = validate(formData, constraints);
  console.log('errors ----> ', errors);
  if (errors) {
    displayErrors(errors);
    return false
  } else {
    clearErrors();
    return true
  }
};

// Validate field
const validateField = (constraints, input) => {
  console.log("input", input.name);
  const fieldName = input.name;
  const fieldValue = input.type === 'file' ? input.files : input.value;
  const errors = validate.single(fieldValue, constraints[fieldName]);
  const errorElement = document.querySelector(`[data-error="${fieldName}"]`);
  if (errorElement) {
    errorElement.textContent = errors ? errors[0] : '';
    errorElement.style.display = errors ? 'block' : 'none';
  }
};

// Custom file presence validator
validate.validators.filePresence = (value, options) => {
  return !value || value.length === 0 ? options.message : null;
};

// Custom quill presence validator
validate.validators.quillPresence = (value, options) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = value || '';
  const text = tempDiv.textContent || tempDiv.innerText || '';
  return text.trim().length === 0 ? options.message : null;
};

// gắn validate tự động cho form
const attachValidateForm = (form, constraints) => {
  form.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('input', () => validateField(constraints, input));
  });
};

// gắn validate tự động cho editor
const attachValidateEditor = (form, field, errorText) => {
  if (typeof quillGlobal !== 'undefined' && quillGlobal) {
    quillGlobal.on('text-change', () => {
      const errEl = form.querySelector(`[data-error="${field}"]`);
      const hasText = quillGlobal.getText().trim().length > 0;
      if (hasText) {
        errEl.textContent = '';
        errEl.style.display = 'none';
      } else {
        errEl.textContent = errorText;
        errEl.style.display = 'block';
      }
    });
  }
};
