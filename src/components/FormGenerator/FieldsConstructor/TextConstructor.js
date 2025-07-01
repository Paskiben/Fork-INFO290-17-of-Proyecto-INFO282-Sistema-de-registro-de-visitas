import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Input, Button, List, ListItem, CheckBox, Icon, Divider } from '@ui-kitten/components'
import * as Sentry from '@sentry/react-native'

const TextoConstructor = ({ field, onSave }) => {

    const enumLimitaciones = {
        "solo letras": 0,
        "solo numeros": 1,
        "solo enteros": 2,
        "solo enteros positivos y cero": 3,
        "email": 4,
        "no numeros": 5,
    }

    const enumFormato = {
        "solo mayusculas": 0,
        "solo minusculas": 1,
    }

    const compatibilidadesLimitaciones = [
        [1, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0, 0],
        [0, 1, 1, 0, 0, 0],
        [0, 1, 0, 1, 0, 0],
        [0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 1],
    ]


    const compatibilidadFormato = [
        [1, 1], // "solo letras"
        [0, 0], // "solo numeros" (ambos formatos deshabilitados)
        [0, 0], // "solo enteros" (ambos formatos deshabilitados)
        [0, 0], // "solo enteros positivos y cero" (ambos formatos deshabilitados)
        [1, 1], // "email"
        [1, 1], // "no numeros"
    ]

    Sentry.captureMessage(field)
    Sentry.captureMessage(Array.isArray(field.limitaciones))
    const [fieldName, setFieldName] = useState(field.nombre ?? '')
    const [selectedLimitaciones, setSelectedLimitaciones] = useState(Array.isArray(field.limitaciones) ?
        field.limitaciones.map(limitacion => enumLimitaciones[limitacion])
        :
        [])
    const [selectedFormato, setSelectedFormato] = useState(Array.isArray(field.formato) ?
        field.formato.map(formato => enumFormato[formato])
        :
        [])
    const [isRequired, setIsRequired] = useState(field.obligatorio ?? true)
    const [isRequiredQR, setIsRequiredQR] = useState(field.rellenarQR ?? false)
    const [showLimitations, setShowLimitations] = useState(false)
    const [showFormat, setShowFormat] = useState(false)
    const [showOptional, setShowOptional] = useState(false)
    Sentry.captureMessage(selectedFormato)
    const toggleLimitacion = index => {
        const newLimitaciones = selectedLimitaciones.includes(index)
            ? selectedLimitaciones.filter(i => i !== index)
            : [...selectedLimitaciones, index].filter(i => isLimitacionCompatible(i, [...selectedLimitaciones, index]))

        setSelectedLimitaciones(newLimitaciones)

    }

    const handleSelectFormato = index => {
        selectedFormato.includes(index) ?
            setSelectedFormato([]) :
            isFormatoCompatibleWithLimitaciones(index, selectedLimitaciones) ?
                setSelectedFormato([index]) :
                null
    }

    const isLimitacionDisabled = index => selectedLimitaciones.length > 0 && !isLimitacionCompatible(index, selectedLimitaciones) || compatibilidadFormato[index][selectedFormato[0]] === 0
    const isFormatoDisabled = index => !isFormatoCompatibleWithLimitaciones(index, selectedLimitaciones)
    const isFormatoCompatibleWithLimitaciones = (formatoIndex, limitaciones) => limitaciones.every(limitacion => compatibilidadFormato[limitacion][formatoIndex])

    const isLimitacionCompatible = (newLimitacion, currentLimitaciones) => (
        currentLimitaciones.every(existing => compatibilidadesLimitaciones[existing][newLimitacion])
    )


    const handleSave = () => {
        const limitaciones = selectedLimitaciones.map(index =>
            Object.keys(enumLimitaciones).find(key => enumLimitaciones[key] === index)
        )

        const formato = selectedFormato.map(index =>
            Object.keys(enumFormato).find(key => enumFormato[key] === index)
        )
        const field = {
            tipo: 'texto',
            nombre: fieldName,
            salida: fieldName.toLowerCase().replace(/ /g, '_'),
            limitaciones: limitaciones ? limitaciones : null,
            formato: formato ? formato : [],
            obligatorio: isRequired,
            rellenarQR: isRequiredQR,
        }

        onSave(field)
    }

    const renderLimitacionItem = ({ item, index }) => (
        <ListItem
            title={item[0].toUpperCase() + item.slice(1)}
            disabled={isLimitacionDisabled(index)}
            accessoryLeft={() => (
                <CheckBox
                    status='success'
                    checked={selectedLimitaciones.includes(index)}
                    disabled={isLimitacionDisabled(index)}
                    style={{ marginTop: '1%' }}
                    onChange={() => toggleLimitacion(index)}
                />
            )}
            onPress={() => toggleLimitacion(index)}
        />
    )

    const renderFormatoItem = ({ item, index }) => (
        <ListItem
            title={item[0].toUpperCase() + item.slice(1)}
            disabled={isFormatoDisabled(index)}
            accessoryLeft={() => (
                <CheckBox
                    status='success'
                    checked={selectedFormato.includes(index)}
                    disabled={isFormatoDisabled(index)}
                    style={{ marginTop: '1%' }}
                    onChange={() => handleSelectFormato(index)}
                />
            )}
        />
    )

    React.useEffect(() => { handleSave() }, [fieldName, selectedLimitaciones, selectedFormato, isRequired, isRequiredQR])

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{fieldName.length ? fieldName : "Nuevo campo de texto"} </Text>

            <Divider />

            <View style={styles.field}>
                <Input
                    label="Nombre del Campo de texto"
                    style={styles.input}
                    placeholder="Ingrese un nombre"
                    value={fieldName}
                    onChangeText={setFieldName}
                />
            </View>

            <Divider />

            <TouchableOpacity style={styles.headerRow} onPress={() => setShowLimitations(!showLimitations)}>
                <Text style={styles.subtitle}>Limitaciones</Text>
                <Button
                    appearance='ghost'
                    accessoryLeft={props => <Icon name='arrow-ios-downward-outline' {...props} />}
                    onPress={() => setShowLimitations(!showLimitations)}
                    style={styles.toggleButton}
                />
            </TouchableOpacity>
            {showLimitations &&
                <View style={styles.submenu}>
                    <List
                        data={Object.keys(enumLimitaciones)}
                        renderItem={renderLimitacionItem}
                    />
                </View>
            }

            <Divider />

            <TouchableOpacity style={styles.headerRow} onPress={() => setShowFormat(!showFormat)}>
                <Text style={styles.subtitle}>Formato</Text>
                <Button
                    appearance='ghost'
                    accessoryLeft={(props) => <Icon name='arrow-ios-downward-outline' {...props} />}
                    onPress={() => setShowFormat(!showFormat)}
                    style={styles.toggleButton}
                />
            </TouchableOpacity>
            {showFormat &&
                <View style={styles.submenu}>
                    <List
                        data={Object.keys(enumFormato)}
                        renderItem={renderFormatoItem}
                    />
                </View>
            }

            <Divider />

            <TouchableOpacity style={styles.headerRow} onPress={() => setShowOptional(!showOptional)}>
                <Text style={styles.subtitle}>Características opcionales</Text>
                <Button
                    appearance='ghost'
                    accessoryLeft={(props) => <Icon name='arrow-ios-downward-outline' {...props} />}
                    onPress={() => setShowOptional(!showOptional)}
                    style={styles.toggleButton}
                />
            </TouchableOpacity>
            {showOptional &&
                <View style={styles.submenu}>
                    <List
                        data={[
                            { title: '¿Aceptar respuesta por QR?', checked: isRequiredQR, onPress: () => setIsRequiredQR(!isRequiredQR) },
                            { title: 'Obligatorio', checked: isRequired, onPress: () => setIsRequired(!isRequired) }
                        ]}
                        renderItem={({ item }) => (
                            <ListItem
                                title={item.title}
                                accessoryLeft={() => (
                                    <CheckBox
                                        status='success'
                                        checked={item.checked}
                                        onChange={item.onPress}
                                        style={{ marginTop: '1%' }}
                                    />
                                )}
                                onPress={item.onPress}
                            />
                        )}
                    />
                </View>
            }

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: "1%",
        backgroundColor: '#ffffff',
    },
    title: {
        marginBottom: 16,
        fontWeight: 'bold',
        fontSize: 18,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        padding: 0,
        borderRadius: 4,
    },
    label: {
        fontSize: 14,
        marginBottom: "3%",

    },
    saveButton: {
        marginTop: 16,
    },
    disabledOption: {
        backgroundColor: '#f0d0d0',
    },
    field: {
        marginTop: "4%",
        marginBottom: "4%",
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Para que el botón esté a la derecha
        borderRadius: 4, // Bordes redondeados
    },
    saveButtonContainer: {
        marginTop: 20,
        alignSelf: 'center',
    },
    submenu: {
        marginLeft: "4%", // Mover los elementos levemente a la derecha
        marginBottom: "4%", // Mover los elementos levemente hacia abajo
        borderLeftWidth: 4, // Solo el borde izquierdo
        borderLeftColor: '#cccccc', // Color del borde izquierdo
    },
})

export default TextoConstructor
