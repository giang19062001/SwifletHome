class FormValidator {
  constructor(formId, constraints) {
    this.form = document.getElementById(formId);
    this.constraints = constraints;
    this.init();
  }

  init() {
    this.form.querySelectorAll('input, select, textarea').forEach((input) => {
      if (input.type !== 'file') {
        input.addEventListener('blur', () => {
          this.validateAndShow();
        });

        input.addEventListener('input', () => {
          const formGroup = input.closest('.form-group');
          if (formGroup && formGroup.classList.contains('has-error')) {
            this.validateAndShow();
          }
        });
      }
    });

    // Submit handler
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  getFormData() {
    const formData = {};
    const inputs = this.form.querySelectorAll('input, select, textarea');

    inputs.forEach((input) => {
      formData[input.name] = input.value.trim();
    });

    return formData;
  }

  showErrors(errors) {
    // Reset errors
    this.form.querySelectorAll('.form-group').forEach((group) => {
      group.classList.remove('has-error');
    });
    this.form.querySelectorAll('.error-message').forEach((el) => {
      el.textContent = '';
    });

    // Show new errors
    if (errors) {
      Object.keys(errors).forEach((fieldName) => {
        const errorElement = this.form.querySelector(
          `[data-error="${fieldName}"]`,
        );
        const inputElement = this.form.querySelector(`[name="${fieldName}"]`);
        const formGroup = inputElement?.closest('.form-group');

        if (errorElement && formGroup) {
          formGroup.classList.add('has-error');
          errorElement.textContent = errors[fieldName][0];
        }
      });
    }
  }

  validateAndShow() {
    const formData = this.getFormData();
    console.log('formData', formData);

    const errors = validate(formData, this.constraints, {
      fullMessages: false,
    });
    this.showErrors(errors);
    return !errors;
  }

  handleSubmit() {
    const isValid = this.validateAndShow();
    const formData = this.getFormData();

    if (isValid) {
      // Callback submit
      if (this.onSubmit) {
        this.onSubmit(formData);
      }
    }
  }

  setSubmitHandler(callback) {
    this.onSubmit = callback;
  }

  // Reset form
  resetForm() {
    this.form.reset();
    this.showErrors(null);
  }
}
