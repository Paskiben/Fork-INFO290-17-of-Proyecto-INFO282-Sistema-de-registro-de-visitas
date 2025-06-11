import React, { forwardRef, useRef, useImperativeHandle } from 'react'
import { Alert } from 'react-native'
import { Button, Text, Layout, Icon } from '@ui-kitten/components'
import OptionSelector, { OptionComponentType, OptionSelectorFeatures } from './selector/OptionSelector'
import TextEntry, { OptionalTextFeatures } from './TextEntry'
import DateSelector, { OptionDateFeatures } from './DateSelector'
import HourSelector, { OptionalTimeFeatures } from './HourSelector'
import CameraConfiguration, { Camera } from './Camera'
import { Err } from '../commonStructures/resultEnum'
import { useIdentifierContext } from '../context/IdentifierContext'
import { StyleSheet } from "react-native"
import { useFormContext } from '../context/SelectedFormContext'
import { useSQLiteContext } from 'expo-sqlite'
import { getDatabaseInstance } from '../database/database'
import * as Sentry from '@sentry/react-native'


const tickIcon = (props) => <Icon name='save' {...props} />

/**
 * A component that renders a dynamic form based on the provided form data.
 *
 * This component handles the state of the form fields, validates required fields,
 * and saves the form data to AsyncStorage when submitted.
 *
 * @param {Object} formData - The data defining the structure and fields of the form.
 * @returns {JSX.Element} The rendered DynamicForm component.
 */

const DynamicForm = forwardRef(({ formData, disabledSave }, ref) => {
    Sentry.captureMessage(formData)
    const db = getDatabaseInstance(useSQLiteContext())
    const requiredFieldRefs = useRef([])
    const refreshFieldRefs = useRef([])
    const formState = useRef(new Map())
    const { selectedForm } = useFormContext()

    const { identifier } = useIdentifierContext() // Identifier

    formData ??= selectedForm

    useImperativeHandle(ref, () => ({
        getMap: () => formState.current,
    }))

    /**
     * Handles the input change for the form fields.
     *
     * @param {string} field - The field name that is being updated.
     * @param {string} value - The new value for the field.
     */
    const handleInputChange = (field, value) => {
        formState.current.set(field, value)
    }

    useImperativeHandle(ref, () => ({
        getMap: () => formState.current,
    }))

    /**
     * Handles the submission of the form.
     *
     * Validates that all required fields are filled before saving the form data
     * to AsyncStorage. If any required fields are empty, an alert is shown.
     */
    const handleSubmit = async () => {
        const requiredFields = formData.campos.filter(field => field.obligatorio)
        const emptyFields = requiredFields.some(field => !(formState.current.get(field.salida)[1]))
        if (emptyFields) {
            requiredFieldRefs.current.forEach(ref => ref())
            return (new Err('Complete todos los campos obligatorios')).show()
        }


        try {
            const newForm = {
                fecha: new Date().getTime(),
                plantilla: formData["nombre formulario"],
                umplantilla: formData["ultima modificacion"],
                data: Object.fromEntries(formState.current),
                idDispositivo: identifier
            }
            Sentry.captureMessage(JSON.stringify(newForm, null, 2))
            db.insertAnswer(newForm)

            Alert.alert("Formulario guardado")
            formState.current.clear()
            refreshFieldRefs.current.forEach(ref => ref())
        } catch (error) {
            Sentry.captureException("Error al guardar el formulario:", error)
        }
    }
    /**
     * Renders a field based on the field type.
     *
     * @param {Object} field - The field data containing type and options.
     * @param {number} index - The index of the field in the form.
     * @returns {JSX.Element|null} The rendered field component or null if the type is unsupported.
     */
    const renderField = (field, index) => {
        const requiredFieldRef = useRef(null)
        const refreshFieldRef = useRef(null)
        refreshFieldRefs.current.push(() => refreshFieldRef.current())
        requiredFieldRefs.current.push(() => requiredFieldRef.current())  // Añadir la referencia al array
        Sentry.captureMessage(field)
        
        switch (field.tipo) {
            case 'selector':
                Sentry.captureMessage('selector')
                return (
                    <OptionSelector
                        key={`selector-${index}`}
                        type={OptionComponentType.DROPDOWN}
                        items={field.opciones}
                        onSelect={(value) => handleInputChange(field.salida, [`selector`, value])}
                        requiredFieldRef={requiredFieldRef}
                        refreshFieldRef={refreshFieldRef}
                        optionalFeatures={OptionSelectorFeatures({
                            title: field.nombre,
                            defaultOption: field['opcion predeterminada'],
                            placeholder: field['texto predeterminado'],
                            required: field.obligatorio,
                            disabled: disabledSave
                        })}
                    />
                )
            case 'checkbox':
                Sentry.captureMessage('checkbox')
                return (
                    <OptionSelector
                        key={`checkbox-${index}`}
                        type={OptionComponentType.CHECKBOX}
                        items={field.opciones}
                        onSelect={(value) => handleInputChange(field.salida, ['checkbox', value])}
                        requiredFieldRef={requiredFieldRef}
                        refreshFieldRef={refreshFieldRef}
                        optionalFeatures={OptionSelectorFeatures({
                            title: field.nombre,
                            defaultOption: field['opcion predeterminada'],
                            placeholder: field['texto predeterminado'],
                            maxChecked: field['cantidad de elecciones'],
                            required: field['obligatorio'],
                            disabled: disabledSave
                        })}
                    />
                )
            case 'radio':
                Sentry.captureMessage('radio')
                return (
                    <OptionSelector
                        key={`radio-${index}`}
                        type={OptionComponentType.RADIO}
                        items={field.opciones}
                        onSelect={(value) => handleInputChange(field.salida, ['radio', value])}
                        requiredFieldRef={requiredFieldRef}
                        refreshFieldRef={refreshFieldRef}
                        optionalFeatures={OptionSelectorFeatures({
                            title: field.nombre,
                            defaultOption: field['opcion predeterminada'],
                            placeholder: field['texto predeterminado'],
                            maxChecked: field['cantidad de elecciones'],
                            required: field['obligatorio'],
                            disabled: disabledSave
                        })}
                    />
                )
            case 'fecha':
                //Sentry.captureMessage(field['limitaciones'])
                Sentry.captureMessage('fecha')
                return (
                    <DateSelector
                        key={`fecha-${index}`}
                        value={formState.current.get(field.salida)}
                        onChange={(value) => handleInputChange(field.salida, ['fecha', value])}
                        requiredFieldRef={requiredFieldRef}
                        refreshFieldRef={refreshFieldRef}
                        optionalFeatures={OptionDateFeatures({
                            title: field.nombre,
                            placeholder: field['texto predeterminado'],
                            defaultDate: field['fecha predeterminada'],
                            dateFormat: field['formato'],
                            disabled: field['limitaciones'].includes('no editable') || disabledSave,
                            required: field['obligatorio']
                        })}
                    />
                )
            case 'hora': {
                const now = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0')
                Sentry.captureMessage('hora')
                //Sentry.captureMessage(field)
                return (
                    <HourSelector
                        key={`hora-${index}`}
                        value={formState.current.get(field.salida)}
                        onChange={(value) => handleInputChange(field.salida, ["hora", value])}
                        requiredFieldRef={requiredFieldRef}
                        refreshFieldRef={refreshFieldRef}
                        optionalFeatures={OptionalTimeFeatures({
                            title: field.nombre,
                            defaultTime: field['hora predeterminada'] === 'actual' ? now : field['hora predeterminada'],
                            disabled: field['limitaciones'].includes('no editable') || disabledSave,
                            required: field['obligatorio']
                        })}
                    />
                )
            }
            case 'camara':
                requiredFieldRefs.current.push(() => requiredFieldRef.current())  // Añadir la referencia al array
                Sentry.captureMessage('camara:', field)
                return (
                    <Camera
                        key={`camara-${index}`}
                        title={field.nombre}
                        required={field.obligatorio}
                        requiredFieldRef={requiredFieldRef}
                        refreshFieldRef={refreshFieldRef}
                        disabled={disabledSave}
                        cameraConfiguration={new CameraConfiguration(
                            value => handleInputChange(field.salida, ['camara', value]),
                            field.editable,
                            field['relacion de aspecto']
                        )}
                    />
                )
            case 'texto':
                requiredFieldRefs.current.push(() => requiredFieldRef.current())  // Añadir la referencia al array
                Sentry.captureMessage('texto:', field)
                return (
                    <TextEntry
                        key={`texto-${index}`}
                        requiredFieldRef={requiredFieldRef}
                        refreshFieldRef={refreshFieldRef}
                        optionalFeatures={OptionalTextFeatures({
                            title: field.nombre,
                            required: field.obligatorio,
                            limitations: field.limitaciones,
                            format: field.formato,
                            QRfield: field.rellenarQR,
                            disabled: disabledSave
                        })}
                        onSelect={(value) => handleInputChange(field.salida, ['texto', value])}
                    />
                )
            default:
                Sentry.captureException(`Unsupported field type: ${field.tipo}`)
                return null
        }
    }

    return (
        <Layout style={styles.layoutContainer}>
            {formData.campos.map((field, index) => renderField(field, index))}
            {
                disabledSave ||
                <Button onPress={handleSubmit} style={styles.button} accessoryLeft={tickIcon}>
                    <Text style={styles.buttonText}>Guardar</Text>
                </Button>
            }
        </Layout>
    )
})

const styles = StyleSheet.create({
    button: {
        borderRadius: 10,
        borderColor: "#53a75f",
        height: 60,
        marginBottom:10,
        padding:10
    },
    buttonText: {
        color: 'black',
        fontWeight: "bold",
        fontSize: 18
    },
    layoutContainer: {
        backgroundColor: "#ffffff"
    },
})

export default DynamicForm
