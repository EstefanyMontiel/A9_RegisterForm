    import React, { useState } from 'react';
    import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    } from 'react-native';
    import DatePicker from '@react-native-community/datetimepicker';
    import styles from '../../styles/RegisterFormStyles';

    const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        fechaNacimiento: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Función para abrir el calendario
    const openDatePicker = () => {
        setShowDatePicker(true);
    };

    // Función cuando se selecciona una fecha (API de @react-native-community/datetimepicker)
    const onDateChange = (event, date) => {
        setShowDatePicker(false);
        
        if (date) {
        setSelectedDate(date);
        
        // Formatear la fecha como DD/MM/YYYY
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        
        setFormData(prev => ({
            ...prev,
            fechaNacimiento: formattedDate
        }));

        // Validar la fecha seleccionada
        validateField('fechaNacimiento', formattedDate);
        }
    };

    // Función para calcular la edad con manejo de errores
    const calculateAge = (birthDate) => {
        if (!birthDate) return 0;
        
        try {
        // Convertir fecha DD/MM/YYYY a Date object
        const [day, month, year] = birthDate.split('/').map(Number);
        const birth = new Date(year, month - 1, day);
        const today = new Date();
        
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
        } catch (error) {
        return 0;
        }
    };

    // Función para formatear fecha en texto legible
    const formatDisplayDate = (dateString) => {
        if (!dateString) return 'Seleccionar fecha';
        
        const age = calculateAge(dateString);
        return `${dateString} (${age} años)`;
    };

    // Validaciones (modificada para fecha DD/MM/YYYY)
    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
        case 'nombre':
            if (!value.trim()) {
            newErrors.nombre = 'El nombre es requerido';
            } else if (value.trim().length < 2) {
            newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
            } else {
            delete newErrors.nombre;
            }
            break;

        case 'correo':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
            newErrors.correo = 'El correo es requerido';
            } else if (!emailRegex.test(value)) {
            newErrors.correo = 'Ingresa un correo válido';
            } else {
            delete newErrors.correo;
            }
            break;

        case 'fechaNacimiento':
            if (!value) {
            newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
            } else {
            // Validar formato DD/MM/YYYY
            const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            if (!dateRegex.test(value)) {
                newErrors.fechaNacimiento = 'Formato de fecha inválido. Use DD/MM/YYYY';
            } else {
                const [day, month, year] = value.split('/').map(Number);
                
                // Validaciones básicas de fecha
                if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
                newErrors.fechaNacimiento = 'Fecha inválida';
                } else {
                const date = new Date(year, month - 1, day);
                
                // Validar si la fecha es válida
                if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                    newErrors.fechaNacimiento = 'Fecha inválida';
                } else {
                    const age = calculateAge(value);
                    if (age < 13) {
                    newErrors.fechaNacimiento = 'Debes tener al menos 13 años';
                    } else if (age > 120) {
                    newErrors.fechaNacimiento = 'Por favor ingresa una fecha válida';
                    } else {
                    delete newErrors.fechaNacimiento;
                    }
                }
                }
            }
            }
            break;

        case 'password':
            if (!value) {
            newErrors.password = 'La contraseña es requerida';
            } else if (value.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            } else {
            delete newErrors.password;
            }
            break;

        case 'confirmPassword':
            if (!value) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
            } else if (value !== formData.password) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
            } else {
            delete newErrors.confirmPassword;
            }
            break;

        default:
            break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar cambios en los inputs
    const handleChange = (name, value) => {
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));

        // Validar en tiempo real si el campo ya fue tocado
        if (touched[name]) {
        validateField(name, value);
        }
    };

    // Manejar blur (cuando el usuario sale del input)
    const handleBlur = (name) => {
        setTouched(prev => ({
        ...prev,
        [name]: true
        }));
        validateField(name, formData[name]);
    };

    // Validar formulario completo
    const validateForm = () => {
        const newTouched = {};
        Object.keys(formData).forEach(key => {
        newTouched[key] = true;
        });
        setTouched(newTouched);

        let isValid = true;
        Object.keys(formData).forEach(key => {
        if (!validateField(key, formData[key])) {
            isValid = false;
        }
        });

        return isValid;
    };

    // Manejar registro
    const handleRegister = () => {
        if (validateForm()) {
        // Aquí iría la lógica para enviar los datos al servidor
        Alert.alert(
            '¡Registro Exitoso!',
            'Tu cuenta ha sido creada correctamente',
            [{ text: 'OK', onPress: () => {
            // Limpiar formulario después del registro exitoso
            setFormData({
                nombre: '',
                correo: '',
                fechaNacimiento: '',
                password: '',
                confirmPassword: '',
            });
            setTouched({});
            setSelectedDate(new Date());
            }}]
        );
        } else {
        Alert.alert(
            'Error en el formulario',
            'Por favor, corrige los errores antes de continuar',
            [{ text: 'OK' }]
        );
        }
    };

    const isFormValid = Object.keys(errors).length === 0;

    return (
        <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.title}>Crear Cuenta</Text>

            {/* Campo Nombre */}
            <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
                style={[
                styles.input,
                touched.nombre && errors.nombre && styles.inputError
                ]}
                placeholder="Ingresa tu nombre completo"
                value={formData.nombre}
                onChangeText={(text) => handleChange('nombre', text)}
                onBlur={() => handleBlur('nombre')}
            />
            {touched.nombre && errors.nombre && (
                <Text style={styles.errorText}>{errors.nombre}</Text>
            )}
            </View>

            {/* Campo Correo */}
            <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
                style={[
                styles.input,
                touched.correo && errors.correo && styles.inputError
                ]}
                placeholder="ejemplo@correo.com"
                value={formData.correo}
                onChangeText={(text) => handleChange('correo', text)}
                onBlur={() => handleBlur('correo')}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {touched.correo && errors.correo && (
                <Text style={styles.errorText}>{errors.correo}</Text>
            )}
            </View>

            {/* Campo Fecha de Nacimiento */}
            <View style={styles.inputContainer}>
            <Text style={styles.label}>Fecha de Nacimiento</Text>
            
            {/* Botón para abrir el selector de fecha */}
            <TouchableOpacity
                style={[
                styles.input,
                styles.dateInput,
                touched.fechaNacimiento && errors.fechaNacimiento && styles.inputError
                ]}
                onPress={openDatePicker}
            >
                <Text style={formData.fechaNacimiento ? styles.dateText : styles.placeholderText}>
                {formData.fechaNacimiento ? formatDisplayDate(formData.fechaNacimiento) : 'Seleccionar fecha'}
                </Text>
            </TouchableOpacity>
            
            {touched.fechaNacimiento && errors.fechaNacimiento && (
                <Text style={styles.errorText}>{errors.fechaNacimiento}</Text>
            )}
            </View>

            {/* Campo Contraseña */}
            <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
                style={[
                styles.input,
                touched.password && errors.password && styles.inputError
                ]}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                onBlur={() => handleBlur('password')}
                secureTextEntry
            />
            {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
            )}
            </View>

            {/* Campo Confirmar Contraseña */}
            <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <TextInput
                style={[
                styles.input,
                touched.confirmPassword && errors.confirmPassword && styles.inputError
                ]}
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                onBlur={() => handleBlur('confirmPassword')}
                secureTextEntry
            />
            {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
            </View>

            {/* Date Picker de @react-native-community/datetimepicker */}
            {showDatePicker && (
            <DatePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
                locale="es-ES"
            />
            )}

            {/* Botón de Registro */}
            <TouchableOpacity
            style={[
                styles.button,
                !isFormValid && styles.buttonDisabled
            ]}
            onPress={handleRegister}
            disabled={!isFormValid}
            >
            <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>

            {/* Enlace para regresar al login */}
            <TouchableOpacity
            style={styles.link}
            onPress={onSwitchToLogin}>
            <Text style={styles.linkText}>
                ¿Ya tienes una cuenta? Inicia sesión
            </Text>
            </TouchableOpacity>
        </ScrollView>
        </KeyboardAvoidingView>
    );
    };

    export default RegisterForm;