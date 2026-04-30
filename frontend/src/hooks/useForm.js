import { useState, useCallback, useRef, useEffect } from 'react';

export const useForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);
  
  // Use ref to track validation without causing re-renders
  const validationRef = useRef(null);

  // Validate form - useCallback to memoize
  const validateForm = useCallback(async () => {
    if (!validationSchema) return true;

    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      setIsValid(true);
      return true;
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach(error => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
      setIsValid(false);
      return false;
    }
  }, [values, validationSchema]);

  // Run validation when values change, but debounce it
  useEffect(() => {
    if (validationSchema) {
      // Clear any pending validation
      if (validationRef.current) {
        clearTimeout(validationRef.current);
      }
      
      // Debounce validation to avoid excessive re-renders
      validationRef.current = setTimeout(() => {
        validateForm();
      }, 300);
    }
    
    return () => {
      if (validationRef.current) {
        clearTimeout(validationRef.current);
      }
    };
  }, [values, validationSchema, validateForm]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(true);
  }, [initialValues]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    const isValidForm = await validateForm();
    
    if (isValidForm) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
        setErrors(prev => ({ ...prev, form: error.message }));
      }
    }
    
    setIsSubmitting(false);
  }, [values, validateForm]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    resetForm,
    setValues
  };
};