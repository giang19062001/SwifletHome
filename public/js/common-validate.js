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

  
  // Validate field
  const validateField = (constraints, input) => {
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
  return (!value || value.length === 0) ? options.message : null;
};


