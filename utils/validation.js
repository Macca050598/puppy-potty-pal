export const validateField = (value, rules) => {
  const errors = [];
  
  if (rules.required && !value) {
    errors.push('This field is required');
  }
  
  if (rules.email && !/\S+@\S+\.\S+/.test(value)) {
    errors.push('Invalid email format');
  }
  
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength}`);
  }
  
  return errors;
}; 